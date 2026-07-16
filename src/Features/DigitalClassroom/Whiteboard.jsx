import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "./Whiteboard.css";

const API_URL =
  "http://localhost:5000/api/whiteboard";

const DEFAULT_COLOR = "#111827";
const DEFAULT_STROKE_WIDTH = 3;
const ERASER_WIDTH = 24;

function Whiteboard({ sessionId }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const snapshotRef = useRef(null);
  const currentPointsRef = useRef([]);

  const [tool, setTool] =
    useState("pen");

  const [color, setColor] =
    useState(DEFAULT_COLOR);

  const [
    strokeWidth,
    setStrokeWidth,
  ] = useState(
    DEFAULT_STROKE_WIDTH
  );

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    pendingDrawings,
    setPendingDrawings,
  ] = useState([]);

  const [message, setMessage] =
    useState("");

  const [
    startPosition,
    setStartPosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  const getToken = () => {
    return localStorage.getItem(
      "token"
    );
  };

  const isValidMongoId = (
    value
  ) => {
    return /^[a-fA-F0-9]{24}$/.test(
      String(value || "")
    );
  };

  const getPosition = (
    event
  ) => {
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
        ((event.clientX -
          rectangle.left) /
          rectangle.width) *
        canvas.width,

      y:
        ((event.clientY -
          rectangle.top) /
          rectangle.height) *
        canvas.height,
    };
  };

  const clearCanvasOnly =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      const context =
        contextRef.current;

      if (!canvas || !context) {
        return;
      }

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }, []);

  const drawArrow = useCallback(
    (
      context,
      fromX,
      fromY,
      toX,
      toY
    ) => {
      const arrowSize = 16;

      const angle = Math.atan2(
        toY - fromY,
        toX - fromX
      );

      context.beginPath();

      context.moveTo(
        fromX,
        fromY
      );

      context.lineTo(
        toX,
        toY
      );

      context.moveTo(
        toX,
        toY
      );

      context.lineTo(
        toX -
          arrowSize *
            Math.cos(
              angle -
                Math.PI / 6
            ),
        toY -
          arrowSize *
            Math.sin(
              angle -
                Math.PI / 6
            )
      );

      context.moveTo(
        toX,
        toY
      );

      context.lineTo(
        toX -
          arrowSize *
            Math.cos(
              angle +
                Math.PI / 6
            ),
        toY -
          arrowSize *
            Math.sin(
              angle +
                Math.PI / 6
            )
      );

      context.stroke();
      context.closePath();
    },
    []
  );

  const renderDrawing =
    useCallback(
      (drawing) => {
        const context =
          contextRef.current;

        if (!context) {
          return;
        }

        const drawingData =
          drawing?.drawingData;

        if (
          !drawingData ||
          typeof drawingData !==
            "object"
        ) {
          return;
        }

        const toolType =
          drawing.toolType;

        const drawingColor =
          drawing.color ||
          DEFAULT_COLOR;

        const drawingStrokeWidth =
          Number(
            drawing.strokeWidth
          ) ||
          DEFAULT_STROKE_WIDTH;

        context.save();

        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle =
          drawingColor;
        context.fillStyle =
          drawingColor;
        context.lineWidth =
          drawingStrokeWidth;

        if (
          toolType === "Pen" ||
          toolType === "Eraser"
        ) {
          const points =
            drawingData.points;

          if (
            !Array.isArray(
              points
            ) ||
            points.length === 0
          ) {
            context.restore();
            return;
          }

          context.beginPath();

          context.strokeStyle =
            toolType === "Eraser"
              ? "#ffffff"
              : drawingColor;

          context.lineWidth =
            toolType === "Eraser"
              ? ERASER_WIDTH
              : drawingStrokeWidth;

          context.moveTo(
            Number(points[0].x),
            Number(points[0].y)
          );

          points
            .slice(1)
            .forEach(
              (point) => {
                context.lineTo(
                  Number(
                    point.x
                  ),
                  Number(
                    point.y
                  )
                );
              }
            );

          context.stroke();
          context.closePath();
          context.restore();

          return;
        }

        if (
          toolType === "Shape"
        ) {
          const startX =
            Number(
              drawingData.startX
            );

          const startY =
            Number(
              drawingData.startY
            );

          const endX =
            Number(
              drawingData.endX
            );

          const endY =
            Number(
              drawingData.endY
            );

          const width =
            endX - startX;

          const height =
            endY - startY;

          if (
            drawingData.shapeType ===
            "Rectangle"
          ) {
            context.strokeRect(
              startX,
              startY,
              width,
              height
            );
          }

          if (
            drawingData.shapeType ===
            "Circle"
          ) {
            context.beginPath();

            context.ellipse(
              startX +
                width / 2,
              startY +
                height / 2,
              Math.abs(
                width / 2
              ),
              Math.abs(
                height / 2
              ),
              0,
              0,
              Math.PI * 2
            );

            context.stroke();
            context.closePath();
          }

          if (
            drawingData.shapeType ===
            "Arrow"
          ) {
            drawArrow(
              context,
              startX,
              startY,
              endX,
              endY
            );
          }

          context.restore();
          return;
        }

        if (
          toolType === "Text"
        ) {
          const fontSize =
            Number(
              drawingData.fontSize
            ) || 20;

          const fontWeight =
            Number(
              drawingData.fontWeight
            ) || 600;

          context.fillStyle =
            drawingColor;

          context.font =
            `${fontWeight} ${fontSize}px "Segoe UI", sans-serif`;

          context.fillText(
            String(
              drawingData.text ||
                ""
            ),
            Number(
              drawingData.x ||
                0
            ),
            Number(
              drawingData.y ||
                0
            )
          );
        }

        context.restore();
      },
      [drawArrow]
    );

  const loadWhiteboard =
    useCallback(async () => {
      if (!sessionId) {
        setMessage(
          "Session is unavailable."
        );

        setIsLoading(false);
        return;
      }

      if (
        !isValidMongoId(
          sessionId
        )
      ) {
        setMessage(
          "Invalid classroom session."
        );

        setIsLoading(false);
        return;
      }

      const token = getToken();

      if (!token) {
        setMessage(
          "Please login first."
        );

        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setMessage("");

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
              "Unable to load whiteboard"
          );
        }

        if (
          !Array.isArray(
            data.drawings
          )
        ) {
          throw new Error(
            "Invalid whiteboard response"
          );
        }

        clearCanvasOnly();

        data.drawings.forEach(
          (drawing) => {
            renderDrawing(
              drawing
            );
          }
        );

        setPendingDrawings([]);

        if (
          data.drawings.length >
          0
        ) {
          setMessage(
            "Saved whiteboard loaded."
          );
        }
      } catch (error) {
        console.error(
          "Load whiteboard error:",
          error
        );

        setMessage(
          error.message
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      sessionId,
      clearCanvasOnly,
      renderDrawing,
    ]);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const initializeCanvas =
      () => {
        const canvasArea =
          canvas.parentElement;

        const width =
          canvasArea
            ?.getBoundingClientRect()
            .width || 900;

        canvas.width = Math.max(
          Math.floor(width),
          300
        );

        canvas.height = 620;

        const context =
          canvas.getContext("2d");

        if (!context) {
          setMessage(
            "Unable to initialize canvas."
          );

          setIsLoading(false);
          return;
        }

        context.lineCap =
          "round";

        context.lineJoin =
          "round";

        context.lineWidth =
          DEFAULT_STROKE_WIDTH;

        contextRef.current =
          context;

        clearCanvasOnly();

        window.requestAnimationFrame(
          () => {
            loadWhiteboard();
          }
        );
      };

    initializeCanvas();

    return undefined;
  }, [
    sessionId,
    clearCanvasOnly,
    loadWhiteboard,
  ]);

  const sendDrawingToDatabase =
    async (drawingPayload) => {
      if (
        !isValidMongoId(
          sessionId
        )
      ) {
        throw new Error(
          "Invalid classroom session."
        );
      }

      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login before saving."
        );
      }

      const response = await fetch(
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
            ...drawingPayload,
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

      return data;
    };

  const saveDrawingAutomatically =
    async (
      drawingPayload
    ) => {
      try {
        setIsSaving(true);
        setMessage(
          "Saving..."
        );

        await sendDrawingToDatabase(
          drawingPayload
        );

        setMessage(
          "Saved automatically."
        );

        return true;
      } catch (error) {
        console.error(
          "Automatic save error:",
          error
        );

        setPendingDrawings(
          (currentDrawings) => [
            ...currentDrawings,
            drawingPayload,
          ]
        );

        setMessage("");

        return false;
      } finally {
        setIsSaving(false);
      }
    };

  const savePendingDrawings =
    async () => {
      if (
        pendingDrawings.length ===
        0
      ) {
        setMessage(
          "Whiteboard is already saved."
        );

        return;
      }

      try {
        setIsSaving(true);
        setMessage(
          "Saving..."
        );

        const failedDrawings = [];

        for (
          const drawing of
          pendingDrawings
        ) {
          try {
            await sendDrawingToDatabase(
              drawing
            );
          } catch (error) {
            console.error(
              "Pending drawing save error:",
              error
            );

            failedDrawings.push(
              drawing
            );
          }
        }

        setPendingDrawings(
          failedDrawings
        );

        if (
          failedDrawings.length ===
          0
        ) {
          setMessage(
            "Whiteboard saved successfully."
          );
        } else {
          setMessage("");
        }
      } finally {
        setIsSaving(false);
      }
    };

  const startDrawing =
    async (event) => {
      if (isSaving) {
        return;
      }

      const canvas =
        canvasRef.current;

      const context =
        contextRef.current;

      if (!canvas || !context) {
        return;
      }

      const position =
        getPosition(event);

      if (tool === "text") {
        const text =
          window.prompt(
            "Enter text:"
          );

        if (!text?.trim()) {
          return;
        }

        const drawingPayload = {
          drawingData: {
            text: text.trim(),
            x: position.x,
            y: position.y,
            fontSize: 20,
            fontWeight: 600,
          },

          toolType: "Text",
          color,
          strokeWidth,
        };

        context.fillStyle =
          color;

        context.font =
          '600 20px "Segoe UI", sans-serif';

        context.fillText(
          text.trim(),
          position.x,
          position.y
        );

        await saveDrawingAutomatically(
          drawingPayload
        );

        return;
      }

      event.currentTarget
        .setPointerCapture(
          event.pointerId
        );

      setStartPosition(
        position
      );

      currentPointsRef.current = [
        position,
      ];

      snapshotRef.current =
        context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

      setIsDrawing(true);

      context.beginPath();

      context.moveTo(
        position.x,
        position.y
      );
    };

  const draw = (event) => {
    if (!isDrawing) {
      return;
    }

    const context =
      contextRef.current;

    if (!context) {
      return;
    }

    const position =
      getPosition(event);

    context.strokeStyle =
      tool === "eraser"
        ? "#ffffff"
        : color;

    context.lineWidth =
      tool === "eraser"
        ? ERASER_WIDTH
        : strokeWidth;

    context.lineCap = "round";
    context.lineJoin = "round";

    if (
      tool === "pen" ||
      tool === "eraser"
    ) {
      currentPointsRef.current.push(
        position
      );

      context.lineTo(
        position.x,
        position.y
      );

      context.stroke();

      return;
    }

    if (
      snapshotRef.current
    ) {
      context.putImageData(
        snapshotRef.current,
        0,
        0
      );
    }

    context.strokeStyle =
      color;

    context.lineWidth =
      strokeWidth;

    const width =
      position.x -
      startPosition.x;

    const height =
      position.y -
      startPosition.y;

    if (
      tool === "rectangle"
    ) {
      context.strokeRect(
        startPosition.x,
        startPosition.y,
        width,
        height
      );
    }

    if (
      tool === "circle"
    ) {
      context.beginPath();

      context.ellipse(
        startPosition.x +
          width / 2,
        startPosition.y +
          height / 2,
        Math.abs(
          width / 2
        ),
        Math.abs(
          height / 2
        ),
        0,
        0,
        Math.PI * 2
      );

      context.stroke();
    }

    if (tool === "arrow") {
      drawArrow(
        context,
        startPosition.x,
        startPosition.y,
        position.x,
        position.y
      );
    }
  };

  const stopDrawing =
    async (event) => {
      if (!isDrawing) {
        return;
      }

      setIsDrawing(false);

      const context =
        contextRef.current;

      context?.closePath();

      const endPosition =
        getPosition(event);

      let drawingPayload =
        null;

      if (
        tool === "pen" ||
        tool === "eraser"
      ) {
        const points =
          currentPointsRef.current;

        if (
          points.length < 2
        ) {
          return;
        }

        drawingPayload = {
          drawingData: {
            points,
          },

          toolType:
            tool === "pen"
              ? "Pen"
              : "Eraser",

          color:
            tool === "eraser"
              ? "#ffffff"
              : color,

          strokeWidth:
            tool === "eraser"
              ? ERASER_WIDTH
              : strokeWidth,
        };
      }

      if (
        tool === "rectangle" ||
        tool === "circle" ||
        tool === "arrow"
      ) {
        const shapeTypes = {
          rectangle:
            "Rectangle",

          circle: "Circle",

          arrow: "Arrow",
        };

        drawingPayload = {
          drawingData: {
            shapeType:
              shapeTypes[tool],

            startX:
              startPosition.x,

            startY:
              startPosition.y,

            endX:
              endPosition.x,

            endY:
              endPosition.y,
          },

          toolType: "Shape",
          color,
          strokeWidth,
        };
      }

      if (!drawingPayload) {
        return;
      }

      await saveDrawingAutomatically(
        drawingPayload
      );
    };

  const clearWhiteboard =
    async () => {
      if (!sessionId) {
        setMessage(
          "Session is unavailable."
        );

        return;
      }

      const shouldClear =
        window.confirm(
          "Only the assigned trainer can clear the whiteboard. Continue?"
        );

      if (!shouldClear) {
        return;
      }

      const token = getToken();

      if (!token) {
        setMessage(
          "Please login first."
        );

        return;
      }

      try {
        setIsSaving(true);
        setMessage(
          "Clearing whiteboard..."
        );

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

        clearCanvasOnly();
        setPendingDrawings([]);

        setMessage(
          "Whiteboard cleared successfully."
        );
      } catch (error) {
        console.error(
          "Clear whiteboard error:",
          error
        );

        setMessage(
          error.message
        );
      } finally {
        setIsSaving(false);
      }
    };

  const tools = [
    {
      value: "pen",
      label: "Pen",
    },
    {
      value: "eraser",
      label: "Eraser",
    },
    {
      value: "rectangle",
      label: "Rectangle",
    },
    {
      value: "circle",
      label: "Circle",
    },
    {
      value: "arrow",
      label: "Arrow",
    },
    {
      value: "text",
      label: "Text",
    },
  ];

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <div>
          <h2>
            Interactive Whiteboard
          </h2>

          <p>
            Draw and collaborate during
            the live classroom.
          </p>
        </div>

        {message && (
          <p className="save-message">
            {message}
          </p>
        )}
      </div>

      <div className="toolbar">
        {tools.map(
          (toolItem) => (
            <button
              key={
                toolItem.value
              }
              type="button"
              className={
                tool ===
                toolItem.value
                  ? "active-tool"
                  : ""
              }
              onClick={() =>
                setTool(
                  toolItem.value
                )
              }
              disabled={
                isLoading ||
                isSaving
              }
            >
              {toolItem.label}
            </button>
          )
        )}

        <label className="color-picker">
          Color

          <input
            type="color"
            value={color}
            disabled={
              tool === "eraser" ||
              isLoading ||
              isSaving
            }
            onChange={(event) =>
              setColor(
                event.target.value
              )
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
            disabled={
              tool === "eraser" ||
              isLoading ||
              isSaving
            }
            onChange={(event) =>
              setStrokeWidth(
                Number(
                  event.target.value
                )
              )
            }
          />

          <span>
            {strokeWidth}
          </span>
        </label>

        <div className="toolbar-actions">
          <button
            type="button"
            className="save-btn"
            onClick={
              savePendingDrawings
            }
            disabled={
              isSaving ||
              isLoading
            }
          >
            {isSaving
              ? "Saving..."
              : "Save"}
          </button>

          <button
            type="button"
            className="clear-btn"
            onClick={
              clearWhiteboard
            }
            disabled={
              isSaving ||
              isLoading
            }
          >
            Clear
          </button>
        </div>
      </div>

      <div className="canvas-area">
        <canvas
          ref={canvasRef}
          onPointerDown={
            startDrawing
          }
          onPointerMove={draw}
          onPointerUp={
            stopDrawing
          }
          onPointerCancel={
            stopDrawing
          }
          onPointerLeave={
            stopDrawing
          }
        />

        {isLoading && (
          <div className="saving-overlay">
            Loading whiteboard...
          </div>
        )}

        {!isLoading &&
          isSaving && (
            <div className="saving-overlay">
              Saving whiteboard...
            </div>
          )}
      </div>
    </div>
  );
}

export default Whiteboard;