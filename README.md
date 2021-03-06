# This web app was planned as a learning tool

You can find the current version here:
[https://11sense.institute](https://11sense.institute)

Unfortiunately: it does not work out for me xD

So you do not get smart and a math genius by training with this tool.
But the reason for this is actually really interesting.

## The original idea and evolution of the project

The idea was to train mental arithmetic.
The project had two pain points:

- the product: what do we need
- the realization: how to

__Version 1:__ The first prototypes where just containing multiplication tasks.
Based on first tests with users, we figured out, that the calculation of tasks does not have an effect on your ability to be faster in mental arithmetic.

__Version 2:__ That was why I started to implement SUI usability to imitage the real-life situations with communication.
Based on the SUI there was the ability to have a passive repetition of task and answer what had a big impact on the learning curve. But only for the little multiplication table between 1-100. The repetition of the tasks was triggering a "learned by heart" effect.

__Version 3:__ To prove the learning results and provide a usefull statistic, the app needed a comparable frame. I deceded to use a bunch of "x" tasks. One single tasks was not significant, so we needed some kind of average. The implementation was very time consuming (3 weeks) and all in all I had to refactor the hole code 2 times. This was the time, where I dived into ES6, modules and the state machine pattern.

Based on the better statistics I figured out, that the "learning improvements" where only local and not transferable to bigger numbers and also not transferable to decimal places. The reason was, that the users "learned" the answers. But they are still not able to calculate. So what is calculation?

__Version 4:__ To make the training more brainfull instead of knowledge-based, I added a collection of new features like the racing mode, hidden mode and the "salted tasks". I also added preconfigured levels, the "addition" as operator and the possiblility to install the app as a real web app with offline-mode.

## Known errors

- got the feedback, that the app does not fit the screen on old mobile devices (scroll bar visible)
- if microphone access is decined, there is no second chance to allow the usage
- mobile swipe feature for navigation can be disturbing

## How to run tests

    time make test

## What I learned

- The native power of ES6 with modules and namespaces in combination with web-components is impressive. In fact today you do not need any framework to make cool stuff with JS.
- You need to use a state machines to hanle user interaction. Especially for SUIs.
- There are some nasty traps around Sound User Interfaces (SUIs):
  - How to do not recognize your own voice?
  - How to make voice interaction visible?
  - How to handle the "Are you thill there?" Problem?
  - How to translate input and output?
- There is so mutch native power of modern browsers to support voice recognition and voice output.
- User surveys are magic. It takes a lot time to figure out what is needed.
- There is a big difference between knowledge and mental arithmetic. I trained a lot, but it didn't make me mutch better than I was. So in fact the trainer was a failure. But the reason seams to be the way. It is not about voice. Not in the first place.
- If you would train an neuronal network with my method, than it can only reproduce the trained results I think. Unseen tasks are not solvable, because it is not the way math works. So why does I expected something else for humans? I will try this with AI in my next project.
