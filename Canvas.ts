import {Shape, ShapeManager} from "./types.js";
import {ToolArea} from "./ToolArea.js";
import menuApi, { initContextMenu } from "./menuApi.js";
import Color from "./Color.js";

export class Canvas implements ShapeManager {
    private ctx: CanvasRenderingContext2D;
    
    private shapes: {[p: number]: Shape} = {};
    private selectedShapeIds: Set<number> = new Set([]);

    private width: number;
    private height: number;

    constructor(canvasDomElement: HTMLCanvasElement,
                toolarea: ToolArea) {
        const { width, height} = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.ctx = canvasDomElement.getContext("2d");
        
        // register mouse handlers
        canvasDomElement.addEventListener("mousemove",
            createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown",
            createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup",
            createMouseHandler("handleMouseUp"));
        
        // register key handlers (the canvas needs a tabindex in order to get focus to recieve key events)
        canvasDomElement.addEventListener("keydown",
            createKeyHandler("handleKeyDown"));
        canvasDomElement.addEventListener("keyup",
            createKeyHandler("handleKeyUp"));

        // register menu handler
        canvasDomElement.addEventListener("contextmenu",
            createContextmenuHandler());

        function createMouseHandler(methodName: string) {
            return function (e) {
                e = e || window.event;

                if ('object' === typeof e) {
                    const btnCode = e.button,
                        x = e.pageX - this.offsetLeft,
                        y = e.pageY - this.offsetTop,
                        ss = toolarea.getSelectedShapeOrTool();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        const m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            }
        }

        function createKeyHandler(methodName: string) {
            return function (e) {
                e = e || window.event;

                if ('object' === typeof e) {
                    const keyCode = e.keyCode;
                    const ss = toolarea.getSelectedShapeOrTool();

                    if (ss) {
                        const m = ss[methodName] ?? false;

                        // check if method exists
                        if (m) {
                            m.call(ss, keyCode);
                        }
                    }
                }
            }
        }

        const canvas = this;
        function createContextmenuHandler() {
            return function (e) {

                // prevent showing the "normal" contextMenu
                e.preventDefault();

                const x = e.pageX;
                const y = e.pageY;

                const menu = initContextMenu(canvas);
                menu.show(x, y);
            }
        }
    }

    draw(): this {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.stroke();

        // draw shapes
        this.ctx.fillStyle = 'black';
        for (let id in this.shapes) {
            const isSelected = this.selectedShapeIds.has(parseInt(id));
            this.shapes[id].draw(this.ctx, isSelected);
        }
        return this;
    }

    addShape(shape: Shape, redraw: boolean = true): this {
        this.shapes[shape.id] = shape;
        return redraw ? this.draw() : this;
    }

    removeShape(shape: Shape, redraw: boolean = true): this {
        const id = shape.id;
        delete  this.shapes[id];
        return redraw ? this.draw() : this;
    }

    removeShapeWithId(id: number, redraw: boolean = true): this {
        delete  this.shapes[id];
        return redraw ? this.draw() : this;
    }

    // shape selection

    getShapeIdsAtPoint(x: number, y: number): number[] {
        const Ids = [];

        // iterate through all shapes on the canvas
        for (const id in this.shapes) {

            // get the current shape by id
            const shape = this.shapes[id];
            
            // if the point is within the shape area, add it the the id list
            if (shape.isPointInShapeArea(x, y)) {
                Ids.push(parseInt(id));
            }
        }

        // console.log(Ids) // TODO: remove this logging
      
        return Ids
    }

    selectShapeWithId(id: number, redraw?: boolean): this {
        this.selectedShapeIds.add(id);
        return redraw ? this.draw() : this;
    }

    unselectAllShapes(redraw?: boolean): this {
        this.selectedShapeIds = new Set([]);
        return redraw ? this.draw() : this;
    }

    getSelectedShapeIds(): Set<number> {
        return this.selectedShapeIds;
    }

    removeSelectedShapes(): this {
        this.selectedShapeIds.forEach((id) => {
            this.removeShapeWithId(id, false);
        });
        return this.draw();
    }

    // color
    setOutlineColorForSelectedShapes(color: Color, redraw?: boolean): this {
        this.selectedShapeIds.forEach((id) => {
            this.shapes[id].outlineColor = color;
        });
        return redraw ? this.draw() : this; 
    }

    setFillColorForSelectedShapes(color: Color, redraw?: boolean): this {
        this.selectedShapeIds.forEach((id) => {
            this.shapes[id].fillColor = color;
        });
        return redraw ? this.draw() : this;
    }

    // move
    moveSelectedToBackground(redraw?: boolean): this {
        return redraw ? this.draw() : this;
    }

    moveSelectedToForeground(redraw?: boolean): this {
        return redraw ? this.draw() : this;
    }
}

