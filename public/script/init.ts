import { ShapeFactory, ShapeManager } from "./types.js";
import { CircleFactory, LineFactory, RectangleFactory, TriangleFactory } from "./Shapes.js";
import { SelectorFactory, ToolArea } from "./ToolArea.js";
import { Canvas } from "./Canvas.js";

function init() {
    const canvasDomElm = document.getElementById("drawArea") as HTMLCanvasElement;
    const menu = document.getElementsByClassName("tools");
    // Problem here: Factories needs a way to create new Shapes, so they
    // have to call a method of the canvas.
    // The canvas on the other side wants to call the event methods
    // on the toolbar, because the toolbar knows what tool is currently
    // selected.
    // Anyway, we do not want the two to have references on each other
    let canvas: Canvas;
    const sm: ShapeManager = {
        addShape(s, rd) {
            return canvas.addShape(s, rd);
        },
        removeShape(s, rd) {
            return canvas.removeShape(s, rd);
        },
        removeShapeWithId(id, rd) {
            return canvas.removeShapeWithId(id, rd);
        },
        getShapeIdsAtPoint(x, y) {
            return canvas.getShapeIdsAtPoint(x, y);
        },
        selectShapeWithId(id, rd) {
            return canvas.selectShapeWithId(id, rd);
        },
        unselectAllShapes(rd) {
            return canvas.unselectAllShapes(rd);
        },
        getSelectedShapeIds() {
            return canvas.getSelectedShapeIds();
        },
        removeSelectedShapes() {
            return canvas.removeSelectedShapes();
        },
        setFillColorForSelectedShapes(color, rd) {
            return canvas.setFillColorForSelectedShapes(color, rd);
        },
        setOutlineColorForSelectedShapes(color, rd) {
            return canvas.setOutlineColorForSelectedShapes(color, rd);
        },
        moveSelectedToBackground(rd) {
            return canvas.moveSelectedToBackground(rd);
        },
        moveSelectedToForeground(rd) {
            return canvas.moveSelectedToBackground(rd);
        },
    };
    const shapesSelector: ShapeFactory[] = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm),
        new SelectorFactory(sm),
    ];
    const toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea);
    canvas.draw();
}

console.log("RUNNING...");

init();