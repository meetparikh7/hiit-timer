import React, { Component } from "react";
import "./App.css";

if (!window.localStorage.getItem("workouts")) {
  const cardio = `Cardio (name)
# name can be anything, but has to be the first line
# comments start with '#', but cannot be first line
sets 3
burpees 30
elbowplank 15
break 5`;
  window.localStorage.setItem("workouts", JSON.stringify([cardio]));
}

class App extends Component {
  constructor(props) {
    super(props);
    const workouts = JSON.parse(window.localStorage.getItem("workouts"));
    this.state = {
      workouts,
      curIndex: -1,
      workout: "",
      name: undefined,
      steps: undefined,
      sets: undefined,
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

  run = index => {
    const workout = this.state.workouts[index];
    const { name, steps, sets } = this.parseWorkout(workout);
    if (this.interval) window.clearInterval(this.interval);
    this.setState({ curIndex: index, workout, name, steps, sets }, () => {
      this.interval = window.setInterval(this.startTimer, 1000);
      this.startTimer();
    });
  };

  parseWorkout(workout) {
    const lines = workout.split("\n");
    const name = lines[0];
    let sets = 0;
    let steps = [];
    for (const line of lines.slice(1)) {
      if (line[0] === "#") continue;
      const words = line.split(" ");
      if (words[0] === "sets") sets = parseInt(words[1]);
      else steps.push({ title: words[0], time: parseInt(words[1]) });
    }
    return {
      name,
      steps,
      sets
    };
  }

  updateWorkout = () => {
    const { workout, workouts, curIndex } = this.state;
    workouts[curIndex] = workout;
    window.localStorage.setItem("workouts", JSON.stringify(workouts));
    this.setState(
      {
        workouts,
        workout,
        step: -1,
        curset: 0,
        timer: -1,
        done: false,
        popup: false
      },
      () => this.run(curIndex)
    );
  };

  addWorkout = () => {
    const { workouts } = this.state;
    const workout = "New workout";
    this.setState({
      workouts: [...workouts, workout],
      curIndex: workouts.length,
      workout,
      popup: true
    });
  };

  removeWorkout = index => {
    const { workouts } = this.state;
    workouts.splice(index, 1);
    window.localStorage.setItem("workouts", JSON.stringify(workouts));
    this.setState({
      workouts
    });
  };

  render(props, state) {
    const { step, timer, curset, paused, done, popup } = this.state;
    const { workout, name, steps, sets, workouts, curIndex } = this.state;

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
          <div className="workout">
            <br />
            <h3>{name}</h3>
            <br />
            <h3>
              Set {curset + 1} / {sets}
            </h3>
            <br />
            <h2>{steps[step] && steps[step].title}</h2>
            <h1>{timer}</h1>
          </div>
        )}
        {curIndex === -1 && (
          <div className="list">
            {workouts.map((workout, index) => {
              const { name } = this.parseWorkout(workout);
              return (
                <div key={index}>
                  <button
                    className="workoutButton"
                    onClick={() => this.run(index)}
                  >
                    {name}
                  </button>
                  <button
                    className="deleteButton"
                    onClick={() => this.removeWorkout(index)}
                  >
                    X
                  </button>
                </div>
              );
            })}
            <button style={{ width: "100%" }} onClick={this.addWorkout}>
              +
            </button>
          </div>
        )}
        {curIndex !== -1 && (
          <div>
            <button onClick={() => this.setState({ paused: !paused })}>
              Play/Pause
            </button>
            <button onClick={() => this.setState({ popup: true })}>
              Settings
            </button>
          </div>
        )}
        <br />
        {done && <h3>DONE!</h3>}
        {paused && <h3>PAUSED!</h3>}
      </div>
    );
  }
}

export default App;
