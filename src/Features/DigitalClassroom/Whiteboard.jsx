import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "react-router-dom";
import "./Whiteboard.css";

const API_URL =
  "http://localhost:5000/api/whiteboard";

const CANVAS_HEIGHT = 620;

const TOOLS = [
  "Pen",
  "Eraser",
  "Shape",
  "Text",
];

function getStoredUser() {
  try {
    const storedUser =
      localStorage.getItem("authUser");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Unable to read authenticated user:",
      error
    );

    return null;
  }
}

function Whiteboard() {
  const { sessionId } = useParams();

  const canvasRef = useRef(null);
  const canvasAreaRef = useRef(null);

  const isDrawingRef = useRef(false);
  const startPointRef = useRef(null);
  const pointsRef = useRef([]);
  const savedDrawingsRef = useRef([]);
  const messageTimerRef = useRef(null);

  const [tool, setTool] =
    useState("Pen");

  const [color, setColor] =
    useState("#111827");

  const [strokeWidth, setStrokeWidth] =
    useState(3);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const user = getStoredUser();

  const token =
    localStorage.getItem("token");

  const canClear =
    user?.role === "Teacher" ||
    user?.role === "Admin";

  const showMessage = useCallback(
    (text, duration = 2500) => {
      if (messageTimerRef.current) {
        window.clearTimeout(
          messageTimerRef.current
        );
      }

      setMessage(text);

      messageTimerRef.current =
        window.setTimeout(() => {
          setMessage("");
        }, duration);
    },
    []
  );

  const getContext = useCallback(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return null;
    }

    return canvas.getContext("2d");
  }, []);

  const configureContext =
    useCallback(
      (
        context,
        selectedTool = tool,
        selectedColor = color,
        selectedStrokeWidth =
          strokeWidth
      ) => {
        if (!context) {
          return;
        }

        context.lineCap = "round";
        context.lineJoin = "round";

        context.lineWidth =
          Number(selectedStrokeWidth) ||
          3;

        if (
          selectedTool === "Eraser"
        ) {
          context.strokeStyle =
            "#ffffff";

          context.fillStyle =
            "#ffffff";
        } else {
          context.strokeStyle =
            selectedColor;

          context.fillStyle =
            selectedColor;
        }
      },
      [
        color,
        strokeWidth,
        tool,
      ]
    );

  const initializeCanvas =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      const canvasArea =
        canvasAreaRef.current;

      if (!canvas || !canvasArea) {
        return;
      }

      const displayWidth =
        Math.max(
          canvasArea.clientWidth,
          300
        );

      const pixelRatio =
        window.devicePixelRatio || 1;

      canvas.width =
        displayWidth * pixelRatio;

      canvas.height =
        CANVAS_HEIGHT * pixelRatio;

      canvas.style.width =
        `${displayWidth}px`;

      canvas.style.height =
        `${CANVAS_HEIGHT}px`;

      const context =
        canvas.getContext("2d");

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
      );

      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        displayWidth,
        CANVAS_HEIGHT
      );
    }, []);

  const clearCanvasLocally =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      const context =
        getContext();

      if (!canvas || !context) {
        return;
      }

      const rectangle =
        canvas.getBoundingClientRect();

      context.clearRect(
        0,
        0,
        rectangle.width,
        rectangle.height
      );

      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        rectangle.width,
        rectangle.height
      );
    }, [getContext]);

  const drawSavedDrawing =
    useCallback(
      (drawing) => {
        const context =
          getContext();

        if (!context || !drawing) {
          return;
        }

        const drawingData =
          drawing.drawingData || {};

        const drawingTool =
          drawing.toolType || "Pen";

        const drawingColor =
          drawing.color || "#111827";

        const drawingStrokeWidth =
          Number(
            drawing.strokeWidth
          ) || 3;

        configureContext(
          context,
          drawingTool,
          drawingColor,
          drawingStrokeWidth
        );

        if (
          drawingTool === "Pen" ||
          drawingTool === "Eraser"
        ) {
          const points =
            drawingData.points;

          if (
            !Array.isArray(points) ||
            points.length < 2
          ) {
            return;
          }

          context.beginPath();

          context.moveTo(
            points[0].x,
            points[0].y
          );

          for (
            let index = 1;
            index < points.length;
            index += 1
          ) {
            context.lineTo(
              points[index].x,
              points[index].y
            );
          }

          context.stroke();
          context.closePath();

          return;
        }

        if (
          drawingTool === "Shape"
        ) {
          const {
            x,
            y,
            width,
            height,
          } = drawingData;

          const validShape = [
            x,
            y,
            width,
            height,
          ].every(
            (value) =>
              typeof value ===
                "number" &&
              Number.isFinite(value)
          );

          if (!validShape) {
            return;
          }

          context.strokeRect(
            x,
            y,
            width,
            height
          );

          return;
        }

        if (
          drawingTool === "Text"
        ) {
          const {
            x,
            y,
            text,
          } = drawingData;

          if (
            typeof x !== "number" ||
            typeof y !== "number" ||
            typeof text !== "string" ||
            !text.trim()
          ) {
            return;
          }

          context.font =
            `${Math.max(
              drawingStrokeWidth * 6,
              16
            )}px Arial`;

          context.fillText(
            text,
            x,
            y
          );
        }
      },
      [
        configureContext,
        getContext,
      ]
    );

  const redrawAll = useCallback(
    (drawingList) => {
      clearCanvasLocally();

      drawingList.forEach(
        (drawing) => {
          drawSavedDrawing(
            drawing
          );
        }
      );
    },
    [
      clearCanvasLocally,
      drawSavedDrawing,
    ]
  );

  const getPointerPosition =
    useCallback((event) => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return {
          x: 0,
          y: 0,
        };
      }

      const rectangle =
        canvas.getBoundingClientRect();

      return {
        x:
          event.clientX -
          rectangle.left,

        y:
          event.clientY -
          rectangle.top,
      };
    }, []);

  const loadDrawings =
    useCallback(
      async ({
        showLoader = false,
        showSuccess = false,
      } = {}) => {
        if (!sessionId) {
          showMessage(
            "Session ID is missing"
          );

          return;
        }

        if (!token) {
          showMessage(
            "Authentication token is missing. Please login again."
          );

          return;
        }

        try {
          if (showLoader) {
            setLoading(true);
          }

          const response =
            await fetch(
              `${API_URL}/${sessionId}`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to load whiteboard drawings"
            );
          }

          const drawings =
            Array.isArray(
              data.drawings
            )
              ? data.drawings
              : [];

          savedDrawingsRef.current =
            drawings;

          redrawAll(drawings);

          if (showSuccess) {
            showMessage(
              "Whiteboard saved successfully"
            );
          }
        } catch (error) {
          console.error(
            "Load whiteboard error:",
            error
          );

          showMessage(
            error.message ||
              "Unable to load whiteboard"
          );
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [
        redrawAll,
        sessionId,
        showMessage,
        token,
      ]
    );

  const saveDrawing =
    useCallback(
      async (
        drawingData,
        selectedTool
      ) => {
        if (!sessionId) {
          showMessage(
            "Session ID is missing"
          );

          return null;
        }

        if (!token) {
          showMessage(
            "Authentication token is missing"
          );

          return null;
        }

        try {
          setSaving(true);

          const response =
            await fetch(
              `${API_URL}/save`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body: JSON.stringify({
                  sessionId,
                  drawingData,
                  toolType:
                    selectedTool,
                  color,
                  strokeWidth,
                }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to save drawing"
            );
          }

          const savedDrawing =
            data.whiteboard;

          if (savedDrawing) {
            savedDrawingsRef.current =
              [
                ...savedDrawingsRef.current,
                savedDrawing,
              ];
          }

          return savedDrawing;
        } catch (error) {
          console.error(
            "Save drawing error:",
            error
          );

          showMessage(
            error.message ||
              "Unable to save drawing"
          );

          return null;
        } finally {
          setSaving(false);
        }
      },
      [
        color,
        sessionId,
        showMessage,
        strokeWidth,
        token,
      ]
    );

  const beginDrawing =
    useCallback(
      (event) => {
        event.preventDefault();

        const canvas =
          canvasRef.current;

        if (!canvas || saving) {
          return;
        }

        canvas.setPointerCapture?.(
          event.pointerId
        );

        const position =
          getPointerPosition(
            event
          );

        if (tool === "Text") {
          const enteredText =
            window.prompt(
              "Enter text"
            );

          const text =
            enteredText?.trim();

          if (!text) {
            return;
          }

          const context =
            getContext();

          configureContext(
            context
          );

          context.font =
            `${Math.max(
              strokeWidth * 6,
              16
            )}px Arial`;

          context.fillText(
            text,
            position.x,
            position.y
          );

          void saveDrawing(
            {
              x: position.x,
              y: position.y,
              text,
            },
            "Text"
          );

          return;
        }

        isDrawingRef.current =
          true;

        startPointRef.current =
          position;

        pointsRef.current =
          [position];

        const context =
          getContext();

        configureContext(
          context
        );

        if (tool === "Shape") {
          return;
        }

        context.beginPath();

        context.moveTo(
          position.x,
          position.y
        );
      },
      [
        configureContext,
        getContext,
        getPointerPosition,
        saveDrawing,
        saving,
        strokeWidth,
        tool,
      ]
    );

  const continueDrawing =
    useCallback(
      (event) => {
        if (
          !isDrawingRef.current
        ) {
          return;
        }

        event.preventDefault();

        if (tool === "Shape") {
          return;
        }

        const context =
          getContext();

        if (!context) {
          return;
        }

        const position =
          getPointerPosition(
            event
          );

        configureContext(
          context
        );

        pointsRef.current.push(
          position
        );

        context.lineTo(
          position.x,
          position.y
        );

        context.stroke();
      },
      [
        configureContext,
        getContext,
        getPointerPosition,
        tool,
      ]
    );

  const endDrawing =
    useCallback(
      (event) => {
        if (
          !isDrawingRef.current
        ) {
          return;
        }

        event.preventDefault();

        isDrawingRef.current =
          false;

        const canvas =
          canvasRef.current;

        canvas?.releasePointerCapture?.(
          event.pointerId
        );

        const context =
          getContext();

        if (!context) {
          return;
        }

        if (tool === "Shape") {
          const startPoint =
            startPointRef.current;

          const endPoint =
            getPointerPosition(
              event
            );

          if (startPoint) {
            const drawingData = {
              x: startPoint.x,
              y: startPoint.y,

              width:
                endPoint.x -
                startPoint.x,

              height:
                endPoint.y -
                startPoint.y,
            };

            configureContext(
              context
            );

            context.strokeRect(
              drawingData.x,
              drawingData.y,
              drawingData.width,
              drawingData.height
            );

            void saveDrawing(
              drawingData,
              "Shape"
            );
          }
        } else {
          context.closePath();

          const points = [
            ...pointsRef.current,
          ];

          if (points.length > 1) {
            void saveDrawing(
              {
                points,
              },
              tool
            );
          }
        }

        startPointRef.current =
          null;

        pointsRef.current = [];
      },
      [
        configureContext,
        getContext,
        getPointerPosition,
        saveDrawing,
        tool,
      ]
    );

  const handleSave =
    useCallback(async () => {
      await loadDrawings({
        showLoader: true,
        showSuccess: true,
      });
    }, [loadDrawings]);

  const clearWhiteboard =
    useCallback(async () => {
      if (!canClear) {
        showMessage(
          "Only the assigned trainer can clear the whiteboard"
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to clear the entire whiteboard?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setSaving(true);

        const response =
          await fetch(
            `${API_URL}/${sessionId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to clear whiteboard"
          );
        }

        savedDrawingsRef.current =
          [];

        clearCanvasLocally();

        showMessage(
          "Whiteboard cleared successfully"
        );
      } catch (error) {
        console.error(
          "Clear whiteboard error:",
          error
        );

        showMessage(
          error.message ||
            "Unable to clear whiteboard"
        );
      } finally {
        setSaving(false);
      }
    }, [
      canClear,
      clearCanvasLocally,
      sessionId,
      showMessage,
      token,
    ]);

  /*
   * Initialize the canvas first and then
   * retrieve saved drawings from MongoDB.
   *
   * This prevents canvas resizing from
   * removing drawings after page reload.
   */
  useEffect(() => {
    const frameId =
      window.requestAnimationFrame(
        () => {
          initializeCanvas();

          window.requestAnimationFrame(
            () => {
              void loadDrawings({
                showLoader: true,
                showSuccess: false,
              });
            }
          );
        }
      );

    const handleResize = () => {
      initializeCanvas();

      window.requestAnimationFrame(
        () => {
          redrawAll(
            savedDrawingsRef.current
          );
        }
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.cancelAnimationFrame(
        frameId
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    initializeCanvas,
    loadDrawings,
    redrawAll,
  ]);

  useEffect(() => {
    return () => {
      if (
        messageTimerRef.current
      ) {
        window.clearTimeout(
          messageTimerRef.current
        );
      }
    };
  }, []);

  return (
    <section className="whiteboard-container">
      <header className="whiteboard-header">
        <div>
          <h2>
            Collaborative Whiteboard
          </h2>

          <p>
            Trainers and students can
            draw together during the
            live session.
          </p>
        </div>

        {message && (
          <p className="save-message">
            {message}
          </p>
        )}
      </header>

      <div className="toolbar">
        {TOOLS.map(
          (toolName) => (
            <button
              key={toolName}
              type="button"
              className={
                tool === toolName
                  ? "active-tool"
                  : ""
              }
              onClick={() => {
                setTool(toolName);
              }}
              disabled={saving}
            >
              {toolName}
            </button>
          )
        )}

        <label className="color-picker">
          Color

          <input
            type="color"
            value={color}
            onChange={(event) => {
              setColor(
                event.target.value
              );
            }}
            disabled={
              tool === "Eraser" ||
              saving
            }
          />
        </label>

        <label className="stroke-picker">
          Width

          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(event) => {
              setStrokeWidth(
                Number(
                  event.target.value
                )
              );
            }}
            disabled={saving}
          />

          <span>
            {strokeWidth}
          </span>
        </label>

        <div className="toolbar-actions">
          <button
            type="button"
            className="reload-btn"
            onClick={() => {
              void handleSave();
            }}
            disabled={
              loading || saving
            }
          >
            {loading
              ? "Saving..."
              : "Save"}
          </button>

          {canClear && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                void clearWhiteboard();
              }}
              disabled={
                loading || saving
              }
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div
        ref={canvasAreaRef}
        className="canvas-area"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={
            beginDrawing
          }
          onPointerMove={
            continueDrawing
          }
          onPointerUp={
            endDrawing
          }
          onPointerCancel={
            endDrawing
          }
        />

        {saving && (
          <div className="saving-overlay">
            Saving drawing...
          </div>
        )}
      </div>
    </section>
  );
}

export default Whiteboard;