import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss']
})
export class RangeComponent implements OnInit {
  @Input()
  step:number = 5;
  @Input()
  minStep:number = 0;
  @Input()
  maxStep:number = 360;
  @Output()
  onChange: EventEmitter<any> = new EventEmitter();
  @Input()
  value:number = 0;
  @Input()
  labelValue:string = '';
  @Input()
  title: string = '';

  constructor() { }

  ngOnInit(): void {
  }


  private increaseOrDecrease($element: any, isNegative: boolean = false) {
    $element.stopPropagation();
    let value =  this.value ??  $element.target.value;
    let nextValue = value;

    if (isNegative ) {
      nextValue -= this.step;
    } else {
      nextValue += this.step;
    }

    if(nextValue <= this.minStep) {
      value = this.minStep
    }else if(nextValue >= this.maxStep){
      value = this.maxStep;
    }else {
      value = nextValue;
    }

    this.value = value;
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
