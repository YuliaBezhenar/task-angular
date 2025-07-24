import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private subject = new Subject<any>();
  private currentInstrumentId: string | null = null;

  connect(token: string, instrumentId: string): Observable<any> {
    const wsUrl = `wss://platform.fintacharts.com/api/streaming/ws/v1/realtime?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {

      const subscriptionMessage = {
        type: "l1-subscription",
        id: "1",
        instrumentId: instrumentId,
        provider: "oanda",
        subscribe: true,
        kinds: ["last"]
      };

      this.socket.send(JSON.stringify(subscriptionMessage));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("incoming message:", data);
      this.subject.next(data);
    };

    this.socket.onerror = (err) => {
      console.error("error:", err);
    };

    this.socket.onclose = () => {
      console.warn("websocket closed");
    };

    return this.subject.asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      console.log("websocket disconnected");
    }
  }


}
