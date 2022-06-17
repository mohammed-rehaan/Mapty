'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workouts {
  id = (Date.now() + ' ').slice(-10);
  date = new Date();
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    console.log(this.date);
  }
}

class Running extends Workouts {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
    this.setDescription();
  }
  calcPace() {
    this.pace = (this.duration / this.distance).toFixed(1);
  }
  setDescription() {
    this.desc = `🏃‍♂️ Running on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Cycling extends Workouts {
  type = 'cycling';
  constructor(distance, duration, coords, elevGain) {
    super(distance, duration, coords);
    this.elevGain = elevGain;
    this.calcSpeed();
    this.setDescription();
  }

  calcSpeed() {
    this.speed = (this.distance / this.duration).toFixed(1);
  }
  setDescription() {
    this.desc = `🚴‍♂️ Cycling on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  zoomLevel = 13;
  constructor() {
    // getting location on page load
    this._getLocation();

    // Event Listeners
    form.addEventListener('submit', e => {
      e.preventDefault();
      this._renderWorkout();
    });

    inputType.addEventListener('change', function () {
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
      inputElevation
        .closest('.form__row')
        .classList.toggle('form__row--hidden');
    });

    containerWorkouts.addEventListener('click', this._scrollTo.bind(this));
  }
  _getLocation() {
    const currentPosition = navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      () => alert('Check if your location is turned on')
    );
  }
  _loadMap(e) {
    const coords = [e.coords.latitude, e.coords.longitude];
    this.#map = L.map('map').setView(coords, this.zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideform() {
    //   prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    form.classList.add('hidden');
  }

  _renderWorkout() {
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = inputDistance.value;
    const duration = inputDuration.value;
    const cadence = inputCadence.value;
    const elevation = inputElevation.value;
    let workout;

    if (type === 'running')
      workout = new Running(distance, duration, [lat, lng], cadence);
    if (type === 'cycling')
      workout = new Cycling(distance, duration, [lat, lng], elevation);

    this.#workouts.push(workout);

    let html = `
      <li class="workout workout--${type}" data-id="${workout.id}">
       <h2 class="workout__title">${workout.desc}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              type === 'running' ? '🏃‍♂️' : '🚴‍♂️'
            }</span>
                    <span class="workout__value">${distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${duration}</span>
                    <span class="workout__unit">min</span>
                </div>
              `;
    if (type === 'running') {
      html += `
            <div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workout.pace}</span>
                  <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                  <span class="workout__icon">🦶🏼</span>
                  <span class="workout__value">${cadence}</span>
                  <span class="workout__unit">spm</span>
            </div>
        </li>
    `;
    }
    if (type === 'cycling') {
      html += `

            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed}</span>
                <span class="workout__unit">km/min</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${elevation}</span>
                <span class="workout__unit">m</span>
            </div>
        </li>
    `;
    }

    containerWorkouts.insertAdjacentHTML('beforeend', html);
    this._renderWorkoutMarker(workout);
  }
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(workout.desc, {
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
        closeOnEscapeKey: false,
      })
      .openPopup();
    this._hideform();
  }

  _scrollTo(e) {
    const dataId = e.target.closest('.workout');
    if (!dataId) return;

    this.#workouts.forEach(work => {
      if (dataId.dataset.id === work.id) {
        this.#map.setView(work.coords, this.zoomLevel, {
          animate: true,
          duration: 1,
        });
      }
    });
  }
}

const app = new App();
