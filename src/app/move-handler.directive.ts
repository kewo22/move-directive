import { Directive, ElementRef, Renderer2, OnInit, HostListener, AfterViewInit, Input } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';

@Directive({ selector: '[moveHandler]' })

export class MoveHandlerDirective implements OnInit, AfterViewInit {

  @Input() bounds: Bounds;
  @Input() moveElements: HTMLElement[];
  isDown = true;
  offset = [];
  ok = false;
  subscription: Subscription;
  _bounds: Bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  constructor(
    private elem: ElementRef,
    private renderer: Renderer2
  ) {

  }

  ngOnInit() {
    this._bounds.top = (this.bounds.top) ? this.bounds.top : 2;
    this._bounds.right = (this.bounds.right) ? this.bounds.right : 2;
    this._bounds.bottom = (this.bounds.bottom) ? this.bounds.bottom : 2;
    this._bounds.left = (this.bounds.left) ? this.bounds.left : 2;

    this.positionToCenter();
    this.setCursorStyle();

    // if (this.moveElement === undefined) {
    //   this.renderer.setStyle(this.elem.nativeElement, 'cursor', 'move');
    // } else {
    //   this.renderer.setStyle(this.moveElement, 'cursor', 'move');
    // }
  }

  ngAfterViewInit() {
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isDown = true;

    this.validateMoverElement(event);

    this.offset = [
      this.elem.nativeElement.offsetLeft - event.clientX,
      this.elem.nativeElement.offsetTop - event.clientY
    ];

    const _this = this;

    this.subscription =
      fromEvent(document, 'mousemove')
        .subscribe(e => {
          let event = e as MouseEvent;
          event.preventDefault();
          if (this.isDown && this.ok) {
            this.elem.nativeElement.style.left = (event.clientX + _this.offset[0]) + 'px';
            this.elem.nativeElement.style.top = (event.clientY + _this.offset[1]) + 'px';
            _this.elem.nativeElement.style.userSelect = 'none';

            this.fitToBounds();

          } else {
            this.subscription.unsubscribe();
          }
        });
  }

  @HostListener('mouseup', ['$event'])
  onElementMouseUp(event: MouseEvent): void {
    this.elem.nativeElement.style.userSelect = 'initial';
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isDown = false;
    this.ok = false;
    this.elem.nativeElement.style.userSelect = 'initial';
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  fitToBounds() {
    if (this.elem.nativeElement.getBoundingClientRect().top <= this._bounds.top) {
      this.renderer.setStyle(this.elem.nativeElement, "top", this._bounds.top + "px");
    }
    if (this.elem.nativeElement.getBoundingClientRect().left <= this._bounds.left) {
      this.renderer.setStyle(this.elem.nativeElement, "left", this._bounds.left + "px");
    }
    if (this.elem.nativeElement.getBoundingClientRect().right >= window.innerWidth - this._bounds.right) {
      this.renderer.setStyle(this.elem.nativeElement, "left", window.innerWidth - this.elem.nativeElement.getBoundingClientRect().width - this._bounds.right + "px");
    }
    if (this.elem.nativeElement.getBoundingClientRect().bottom >= window.innerHeight - this._bounds.bottom) {
      this.renderer.setStyle(this.elem.nativeElement, "top", window.innerHeight - this.elem.nativeElement.getBoundingClientRect().height - this._bounds.bottom + "px");
    }
  }

  validateMoverElement(event): void {
    // console.log(this.excludes.length);


    if (this.moveElements !== undefined && this.moveElements.length > 0) {
      [].forEach.call(this.moveElements, (exclude) => {
        if (exclude.isSameNode(event.target))
          this.ok = exclude.isSameNode(event.target);
      });
    } else {
      //nothing specified move activated on all elements
      this.ok = true;
    }

    // if (this.moveElement === undefined) {
    //   this.ok = true;
    // } else {
    //   this.ok = this.moveElement.isSameNode(event.target);
    // }
  }

  positionToCenter(): void {

    const top: string = (window.innerHeight - this.elem.nativeElement.getBoundingClientRect().height) / 2 + 'px';
    const left: string = (window.innerWidth - this.elem.nativeElement.getBoundingClientRect().width) / 2 + 'px';

    this.renderer.setStyle(this.elem.nativeElement, 'top', top);
    this.renderer.setStyle(this.elem.nativeElement, 'left', left);
  }

  setCursorStyle(): void {
    if (this.moveElements !== undefined && this.moveElements.length > 0) {
      [].forEach.call(this.moveElements, (exclude) => {
        this.renderer.setStyle(exclude, 'cursor', 'move');
      });
    } else {
      //nothing specified move activated on all elements
      this.renderer.setStyle(this.elem.nativeElement, 'cursor', 'move');
    }
  }

}

interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}