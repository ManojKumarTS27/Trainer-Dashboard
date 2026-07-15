import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Whiteboard.css";

function Whiteboard({ sessionId }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const snapshotRef = useRef(null);

  const [tool, setTool] =
    useState("pen");

  const [color, setColor] =
    useState("#111827");

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [
    startPosition,
    setStartPosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  const storageKey =
    `whiteboard-${sessionId}`;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const parentWidth =
      canvas.parentElement?.clientWidth ||
      900;

    canvas.width = parentWidth;
    canvas.height = 620;

    const context =
      canvas.getContext("2d");

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    contextRef.current = context;

    const savedCanvas =
      localStorage.getItem(storageKey);

    if (savedCanvas) {
      const image = new Image();

      image.src = savedCanvas;

      image.onload = () => {
        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );
      };
    }
  }, [storageKey]);

  const saveCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    localStorage.setItem(
      storageKey,
      canvas.toDataURL()
    );
  };

  const getPosition = (event) => {
    const canvas = canvasRef.current;

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

  const drawArrow = (
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

    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);

    context.moveTo(toX, toY);

    context.lineTo(
      toX -
        arrowSize *
          Math.cos(
            angle - Math.PI / 6
          ),
      toY -
        arrowSize *
          Math.sin(
            angle - Math.PI / 6
          )
    );

    context.moveTo(toX, toY);

    context.lineTo(
      toX -
        arrowSize *
          Math.cos(
            angle + Math.PI / 6
          ),
      toY -
        arrowSize *
          Math.sin(
            angle + Math.PI / 6
          )
    );

    context.stroke();
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!canvas || !context) {
      return;
    }

    const position =
      getPosition(event);

    setStartPosition(position);

    snapshotRef.current =
      context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    if (tool === "text") {
      const text = window.prompt(
        "Enter text:"
      );

      if (text?.trim()) {
        context.fillStyle = color;
        context.font =
          "600 20px Segoe UI";

        context.fillText(
          text.trim(),
          position.x,
          position.y
        );

        saveCanvas();
      }

      return;
    }

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
      tool === "eraser" ? 24 : 3;

    if (
      tool === "pen" ||
      tool === "eraser"
    ) {
      context.lineTo(
        position.x,
        position.y
      );

      context.stroke();

      return;
    }

    if (snapshotRef.current) {
      context.putImageData(
        snapshotRef.current,
        0,
        0
      );
    }

    const width =
      position.x - startPosition.x;

    const height =
      position.y - startPosition.y;

    if (tool === "rectangle") {
      context.strokeRect(
        startPosition.x,
        startPosition.y,
        width,
        height
      );
    }

    if (tool === "circle") {
      context.beginPath();

      context.ellipse(
        startPosition.x + width / 2,
        startPosition.y + height / 2,
        Math.abs(width / 2),
        Math.abs(height / 2),
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

  const stopDrawing = () => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);

    contextRef.current?.closePath();

    saveCanvas();
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!canvas || !context) {
      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    localStorage.removeItem(storageKey);
  };

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <div>
          <h2>Interactive Whiteboard</h2>

          <p>
            Draw and explain concepts live.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <button
          type="button"
          className={
            tool === "pen"
              ? "active-tool"
              : ""
          }
          onClick={() => setTool("pen")}
        >
          Pen
        </button>

        <button
          type="button"
          className={
            tool === "eraser"
              ? "active-tool"
              : ""
          }
          onClick={() =>
            setTool("eraser")
          }
        >
          Eraser
        </button>

        <button
          type="button"
          className={
            tool === "rectangle"
              ? "active-tool"
              : ""
          }
          onClick={() =>
            setTool("rectangle")
          }
        >
          Rectangle
        </button>

        <button
          type="button"
          className={
            tool === "circle"
              ? "active-tool"
              : ""
          }
          onClick={() =>
            setTool("circle")
          }
        >
          Circle
        </button>

        <button
          type="button"
          className={
            tool === "arrow"
              ? "active-tool"
              : ""
          }
          onClick={() =>
            setTool("arrow")
          }
        >
          Arrow
        </button>

        <button
          type="button"
          className={
            tool === "text"
              ? "active-tool"
              : ""
          }
          onClick={() => setTool("text")}
        >
          Text
        </button>

        <label className="color-picker">
          Color

          <input
            type="color"
            value={color}
            onChange={(event) =>
              setColor(
                event.target.value
              )
            }
          />
        </label>

        <button
          type="button"
          className="clear-btn"
          onClick={clearBoard}
        >
          Clear
        </button>
      </div>

      <div className="canvas-area">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
    </div>
  );
}

export default Whiteboard;