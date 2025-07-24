
import { Component, ElementRef, HostListener, OnInit, signal } from '@angular/core';
import { Fintacharts } from '../services/fintacharts';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../services/websocket-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit{
  
  protected readonly title = signal('task-angular');


  public elements: string[] = [];
  public instruments: any[] = [];
  public selectedInstrument: any = null;
  public defaultElement: string = 'Choose item';
  public isOpen = false;

  currentPrice: number | null = null;
  currentTime: string = '';
  subscription!: Subscription;

  chartData: any[] = [];
  view: [number, number] = [700, 400];

  constructor(private eRef: ElementRef, private fintacharts: Fintacharts, private websocket: WebsocketService) { }

  async ngOnInit() {
    const instruments = await this.fintacharts.getInstruments();
    this.instruments = instruments;
    this.elements = instruments.map(inst => inst.symbol); // для dropdown
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectSort(value: string) {
    this.defaultElement = value;
    this.selectedInstrument = this.instruments.find(i => i.symbol === value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  //ngx-charts
  showLegend = false;
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'Price';

  async loadChart() {

    if (!this.selectedInstrument) return;

    const bars = await this.fintacharts.getBars(this.selectedInstrument.id);
    this.chartData = [
      {
        name: this.selectedInstrument.symbol,
        series: bars.map(bar => ({
          name: new Date(bar.t).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(',', ''),
          value: bar.c
        }))
      }
    ];

  }

  async subscribeRealtime() {
    if (!this.selectedInstrument) return;
    
    let token = this.fintacharts.getToken();  
  
    if (!token) {    
      await this.fintacharts.login();
      token = this.fintacharts.getToken();  
    }

    if (!token) {
      console.error("⛔ Не вдалося отримати токен");
      return;
    }
    
    console.log("Id: ", this.selectedInstrument.id);
      
    this.subscription = this.websocket
      .connect(token, this.selectedInstrument.id)
      .subscribe(data => {
        if (data.type === 'l1-update' && data.last && data.instrumentId === this.selectedInstrument.id) {
          this.currentPrice = data.last.price;
          this.currentTime = new Date(data.last.timestamp).toLocaleString();
        }
      });
  }
  
  unsubscribeRealtime() {
    this.websocket.disconnect();
    this.subscription?.unsubscribe();
  }

  Subscribe() {
    this.loadChart();
    this.subscribeRealtime();
  }
  

}





