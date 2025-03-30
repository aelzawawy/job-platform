import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { Location } from '../interfaces/geoJson';
@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MapBoxComponent implements OnInit {
  constructor() {}
  map!: mapboxgl.Map;
  style = 'mapbox://styles/aelzawawy45/clgxx4uzp00eq01p6b1gr00ol';
  lat: number = 31.3;
  lng: number = 30;
  @Input() locations: Location[] = [];
  @Input() flyToo!: [number, number];

  ngOnInit(): void {}
  loggedIn(): boolean {
    if (localStorage['token']) {
      return true;
    }
    return false;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['locations']) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => {
          this.lat = p.coords.latitude;
          this.lng = p.coords.longitude;
          this.map.flyTo({
            center: [this.lng, this.lat],
            zoom: 5,
          });
        });
      }
      this.initializeMap();
    }
    if (changes['flyToo'] && this.locations.length != 0) {
      this.map.flyTo({
        center: changes['flyToo'].currentValue,
        zoom: 9,
      });
      const loc = this.locations.find(
        (loc) => loc.coords == changes['flyToo'].currentValue
      );
      // Wait for the map to finish moving
      this.map.once('moveend', (e) => {
        new mapboxgl.Popup({
          offset: 30,
        })
          .setLngLat(changes['flyToo'].currentValue)
          .setHTML(
            localStorage['token']
              ? `<p style="margin: 0; font-size: 24px"><strong>${loc?.title}</strong></p><p style="margin: 0;">${loc?.address}</p>`
              : `<p style="margin: 0; font-size: 24px"><strong>Please login for details!</strong></p>`
          )
          .addTo(this.map);
      });
    }
  }
  private initializeMap() {
    const bounds = new mapboxgl.LngLatBounds();

    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map', // container ID
      style: this.style,
      scrollZoom: false,
      center: [this.lng, this.lat],
      zoom: 5,
    });

    //! If on mobile and touching one finger
    if (/Mobi/.test(navigator.userAgent)) {
      this.map.dragPan.disable();
      this.map.getContainer().addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          this.map.dragPan.disable();
        } else {
          this.map.dragPan.enable();
        }
      });
    }

    this.map.addControl(new mapboxgl.NavigationControl());
    // todo Create markers
    this.locations.forEach((loc: any) => {
      const el = document.createElement('div');
      el.className = 'marker';
      //todo Add markers
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat(loc.coords || [0, 0])
        .addTo(this.map)
        .setPopup(
          new mapboxgl.Popup({
            offset: 30,
          }).setHTML(
            localStorage['token']
              ? `<p style="margin: 0; font-size: 24px"><strong>${loc.title}</strong></p><p style="margin: 0;">${loc.address}</p>`
              : `<p style="margin: 0; font-size: 24px"><strong>Please login for details!</strong></p>`
          )
        );
      //todo Add popup
      marker.getElement().addEventListener('click', (e) => {
        marker.getPopup().addTo(this.map);
      });
      //todo Extend map bound to include current location
      bounds.extend(loc.coords);
    });

    if (this.locations.length != 0)
      this.map.fitBounds(bounds, {
        maxZoom: 7,
      });
  }
}
