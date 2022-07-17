import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss']
})
export class RangeComponent implements OnInit {
  @Input()
  step:number = 5;
  @Output()
  onChange: EventEmitter<any> = new EventEmitter();
  @Input()
  value:number = 0;
  @Input()
  title: string = '';

  constructor() { }

  ngOnInit(): void {
  }


  private increaseOrDecrease($element: any, isNegative: boolean = false) {
    $element.stopPropagation();
    if (isNegative) {
      this.value -= this.step;
    } else {
      this.value += this.step;
    }
    $element.target.value = this.value;
    $element.target.valueAsNumber = +this.value;
  }

  increaseRange($element: any) {
    this.increaseOrDecrease($element);
    this.change($element);
  }

  decreaseRange($element: any) {
    this.increaseOrDecrease($element, true);
    this.change($element);
  }

  change($element: any) {
    $element.stopPropagation();
    this.onChange.emit($element);
  }

}
