import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {CORE_DIRECTIVES, NgClass} from '@angular/common';
import {FORM_DIRECTIVES, NgModel} from '@angular/forms';
import {DateFormatter} from './date.formatter';

const FORMAT_DAY = 'DD';
const FORMAT_MONTH = 'MMMM';
const FORMAT_YEAR = 'YYYY';
const FORMAT_DAY_HEADER = 'dd';
const FORMAT_DAY_TITLE = 'MMMM YYYY';
const FORMAT_MONTH_TITLE = 'YYYY';
const DATEPICKER_MODE = 'day';
const MIN_MODE = 'day';
const MAX_MODE = 'year';
const SHOW_WEEKS = true;
const ONLY_CURRENT_MONTH = false;
const STARTING_DAY = 0;
const YEAR_RANGE = 20;
const SHORTCUT_PROPAGATION = false;

@Component({
  selector: 'datepicker-inner',
  events: ['update'],
  template: `
    <div *ngIf="datepickerMode" class="well well-sm bg-faded p-a card" role="application" ><!--&lt;!&ndash;ng-keydown="keydown($event)"&ndash;&gt;-->
      <ng-content></ng-content>
    </div>
  `,
  directives: [FORM_DIRECTIVES, CORE_DIRECTIVES, NgClass, NgModel]
})
export class DatePickerInnerComponent implements OnInit {
  @Input() public datepickerMode:string;
  @Input() public startingDay:number;
  @Input() public yearRange:number;

  @Input() public minDate:Date;
  @Input() public maxDate:Date;
  @Input() public minMode:string;
  @Input() public maxMode:string;
  @Input() public showWeeks:boolean;
  @Input() public formatDay:string;
  @Input() public formatMonth:string;
  @Input() public formatYear:string;
  @Input() public formatDayHeader:string;
  @Input() public formatDayTitle:string;
  @Input() public formatMonthTitle:string;
  @Input() public onlyCurrentMonth:boolean;
  @Input() public shortcutPropagation:boolean;
  @Input() public customClass:Array<{date:Date, mode:string, clazz:string}>;

  @Input() public dateDisabled:any;
  @Input() public initDate:Date;

  public stepDay:any = {};
  public stepMonth:any = {};
  public stepYear:any = {};

  private modes:Array<string> = ['day', 'month', 'year'];
  private dateFormatter:DateFormatter = new DateFormatter();

  private uniqueId:string;
  private _activeDate:Date;
  private selectedDate:Date;
  private activeDateId:string;

  private refreshViewHandlerDay:Function;
  private compareHandlerDay:Function;
  private refreshViewHandlerMonth:Function;
  private compareHandlerMonth:Function;
  private refreshViewHandlerYear:Function;
  private compareHandlerYear:Function;
  private update:EventEmitter<Date> = new EventEmitter<Date>(false);

  @Input()
  public get activeDate():Date {
    return this._activeDate;
  }

  public set activeDate(value:Date) {
    this._activeDate = value;
    this.refreshView();
  }

  public ngOnInit():void {
    this.formatDay = this.formatDay || FORMAT_DAY;
    this.formatMonth = this.formatMonth || FORMAT_MONTH;
    this.formatYear = this.formatYear || FORMAT_YEAR;
    this.formatDayHeader = this.formatDayHeader || FORMAT_DAY_HEADER;
    this.formatDayTitle = this.formatDayTitle || FORMAT_DAY_TITLE;
    this.formatMonthTitle = this.formatMonthTitle || FORMAT_MONTH_TITLE;
    this.showWeeks = (this.showWeeks === undefined
      ? SHOW_WEEKS
      : this.showWeeks);
    this.onlyCurrentMonth = (this.onlyCurrentMonth === undefined
      ? ONLY_CURRENT_MONTH
      : this.onlyCurrentMonth);
    this.startingDay = this.startingDay || STARTING_DAY;
    this.yearRange = this.yearRange || YEAR_RANGE;
    this.shortcutPropagation = this.shortcutPropagation || SHORTCUT_PROPAGATION;
    this.datepickerMode = this.datepickerMode || DATEPICKER_MODE;
    this.minMode = this.minMode || MIN_MODE;
    this.maxMode = this.maxMode || MAX_MODE;

    // todo: use date for unique value
    this.uniqueId = 'datepicker-' + '-' + Math.floor(Math.random() * 10000);

    if (this.initDate) {
      this.activeDate = this.initDate;
      this.selectedDate = new Date(this.activeDate.valueOf());
      this.update.emit(this.activeDate);
    } else if (this.activeDate === undefined) {
      this.activeDate = new Date();
    }

    this.refreshView();
  }

  public setCompareHandler(handler:Function, type:string):void {
    if (type === 'day') {
      this.compareHandlerDay = handler;
    }

    if (type === 'month') {
      this.compareHandlerMonth = handler;
    }

    if (type === 'year') {
      this.compareHandlerYear = handler;
    }
  }

  public compare(date1:Date, date2:Date):number {
    if(date1=== undefined || date2 === undefined) {
      return undefined;
    }

    if (this.datepickerMode === 'day' && this.compareHandlerDay) {
      return this.compareHandlerDay(date1, date2);
    }

    if (this.datepickerMode === 'month' && this.compareHandlerMonth) {
      return this.compareHandlerMonth(date1, date2);
    }

    if (this.datepickerMode === 'year' && this.compareHandlerYear) {
      return this.compareHandlerYear(date1, date2);
    }

    return void 0;
  }

  public setRefreshViewHandler(handler:Function, type:string):void {
    if (type === 'day') {
      this.refreshViewHandlerDay = handler;
    }

    if (type === 'month') {
      this.refreshViewHandlerMonth = handler;
    }

    if (type === 'year') {
      this.refreshViewHandlerYear = handler;
    }
  }

  public refreshView():void {
    if (this.datepickerMode === 'day' && this.refreshViewHandlerDay) {
      this.refreshViewHandlerDay();
    }

    if (this.datepickerMode === 'month' && this.refreshViewHandlerMonth) {
      this.refreshViewHandlerMonth();
    }

    if (this.datepickerMode === 'year' && this.refreshViewHandlerYear) {
      this.refreshViewHandlerYear();
    }
  }

  public dateFilter(date:Date, format:string):string {
    return this.dateFormatter.format(date, format);
  }

  public isActive(dateObject:any):boolean {
    if (this.compare(dateObject.date, this.activeDate) === 0) {
      this.activeDateId = dateObject.uid;
      return true;
    }

    return false;
  }

  public createDateObject(date:Date, format:string):any {
    let dateObject:any = {};
    dateObject.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    dateObject.label = this.dateFilter(date, format);
    dateObject.selected = this.compare(date, this.selectedDate) === 0;
    dateObject.disabled = this.isDisabled(date);
    dateObject.current = this.compare(date, new Date()) === 0;
    dateObject.customClass = this.getCustomClassForDate(dateObject.date);
    return dateObject;
  }

  public split(arr:Array<any>, size:number):Array<any> {
    let arrays:Array<any> = [];
    while (arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  }

  public fixTimeZone(date:Date):Date {
    let hours = date.getHours();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours === 23 ? hours + 2 : 0);
  }

  public select(date:Date):void {

    if (this.datepickerMode === this.minMode) {
      if (!this.activeDate) {
        this.activeDate = new Date(0, 0, 0, 0, 0, 0, 0);
      }

      this.activeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } else {
      this.activeDate = date;
      this.datepickerMode = this.modes[this.modes.indexOf(this.datepickerMode) - 1];
    }

    this.selectedDate = new Date(this.activeDate.valueOf());
    this.update.emit(this.activeDate);
    this.refreshView();

  }

  public move(direction:number):void {
    let expectedStep:any;
    if (this.datepickerMode === 'day') {
      expectedStep = this.stepDay;
    }

    if (this.datepickerMode === 'month') {
      expectedStep = this.stepMonth;
    }

    if (this.datepickerMode === 'year') {
      expectedStep = this.stepYear;
    }

    if (expectedStep) {
      let year = this.activeDate.getFullYear() + direction * (expectedStep.years || 0);
      let month = this.activeDate.getMonth() + direction * (expectedStep.months || 0);
      this.activeDate = new Date(year, month, 1);

      this.refreshView();
    }
  }

  public toggleMode(direction:number):void {
    direction = direction || 1;

    if ((this.datepickerMode === this.maxMode && direction === 1) ||
      (this.datepickerMode === this.minMode && direction === -1)) {
      return;
    }

    this.datepickerMode = this.modes[this.modes.indexOf(this.datepickerMode) + direction];
    this.refreshView();
  }

  private getCustomClassForDate(date:Date):string {
    if (!this.customClass) {
      return '';
    }

    const customClassObject:{date:Date, mode:string, clazz:string} = this.customClass
      .find((customClass:any) => {
        return customClass.date.valueOf() === date.valueOf() &&
          customClass.mode === this.datepickerMode;
      }, this);
    return customClassObject === undefined ? '' : customClassObject.clazz;
  }

  private isDisabled(date:Date):boolean {

    return ((this.minDate && this.compare(date, this.minDate) < 0) ||
    (this.maxDate && this.compare(date, this.maxDate) > 0));
  }
}