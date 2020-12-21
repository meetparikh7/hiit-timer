import React, { Component } from "react";
import "./App.css";

if (!window.localStorage.getItem("workout")) {
  window.localStorage.setItem(
    "workout",
    `sets 3
burpees 30
elbowplank 15`
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    const workout = window.localStorage.getItem("workout");
    const { steps, sets } = this.parseWorkout(workout);
    this.state = {
      workout,
      steps,
      sets,
      step: -1,
      curset: 0,
      timer: -1,
      paused: false,
      done: false,
      popup: false
    };
  }

  startTimer = () => {
    const { step, timer, curset, paused } = this.state;
    const { steps, sets } = this.state;
    if (paused) return;
    if (timer <= 0) {
      let nextStep = step + 1;
      if (nextStep >= steps.length) {
        if (curset + 1 < sets) this.setState({ curset: curset + 1 });
        else {
          this.setState({ done: true });
          window.clearInterval(this.interval);
        }
        nextStep = 0;
      }
      this.setState({
        step: nextStep,
        timer: steps[nextStep].time
      });
    } else {
      this.setState({ timer: timer - 1 });
    }
  };

  run = () => {
    this.interval = window.setInterval(this.startTimer, 1000);
    this.startTimer();
  };

  parseWorkout(workout) {
    const lines = workout.split("\n");
    let sets = 0;
    let steps = [];
    for (const line of lines) {
      const words = line.split(" ");
      if (words[0] === "sets") sets = parseInt(words[1]);
      else steps.push({ title: words[0], time: parseInt(words[1]) });
    }
    return {
      steps,
      sets
    };
  }

  updateWorkout = () => {
    const { workout } = this.state;
    window.localStorage.setItem("workout", workout);
    const { steps, sets } = this.parseWorkout(workout);
    this.setState({
      workout,
      steps,
      sets,
      step: -1,
      curset: 0,
      timer: -1,
      done: false,
      popup: false
    });
  };

  render(props, state) {
    const { step, timer, curset, paused, done, popup } = this.state;
    const { workout, steps, sets } = this.state;

    return (
      <div style={{ textAlign: "center" }}>
        {popup && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "white"
            }}
          >
            <textarea
              value={workout}
              onChange={e => this.setState({ workout: e.target.value })}
            />
            <br />
            <button onClick={this.updateWorkout}>Close</button>
          </div>
        )}
        {timer !== -1 && (
          <div>
            <br />
            <h3>
              Set {curset + 1} / {sets}
            </h3>
            <br />
            <h2>{steps[step] && steps[step].title}</h2>
            <br />
            <h1>{timer}</h1>
          </div>
        )}
        {timer === -1 && (
          <button onClick={this.run} className="runBtn">
            <h1>Run</h1>
          </button>
        )}
        <div>
          <button onClick={() => this.setState({ paused: !paused })}>
            Play/Pause
          </button>
          <button onClick={() => this.setState({ popup: true })}>
            Settings
          </button>
        </div>
        <br />
        {done && <h3>DONE!</h3>}
        {paused && <h3>PAUSED!</h3>}
      </div>
    );
  }
}

export default App;
