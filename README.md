# This web app is a learning tool

You can find the current version here:
https://dorie.8qfx1ai5.de/

## The original idea and evolution of the project
The idea was to train mental arithmetic.
The project had two pain points:

- the product: what do we need
- the realization: how to

__1. Generation:__ The first prototypes where just containing multiplication tasks.
Based on first tests with users, we figured out, that the calculation of tasks does not have an effect on your ability to be faster in mental arithmetic.

__2. Generation:__ That was why I started to implement SUI usability to imitage the real-life situations with communication.
Based on the SUI there was the ability to have a passive repetition of task and answer what had a big impact on the learning curve. But only for the little multiplication table between 1-100. The repetition of the tasks was triggering a "learned by heart" effect.

__3. Generation:__ To prove the learning results and provide a usefull statistic, the app needed a comparable frame. I deceded to use a bunch of "x" tasks. One single tasks was not significant, so we needed some kind of average. The implementation was very time consuming (3 Weeks) and all in all I had to refactore the hole code 2 times. This was the time, where I dived into ES6, modules and the state machine pattern.

Based on the better statistics I figured out, that the "learning improvements" where only local and not transferable to bigger numbers and also not transferable to decimal places. The reason was, that the users "learned" the answers. But they are not able to calculate. So what is calculation?

Finally I found a very simpel task to train your calculation possibilities with a simple calculator. First of all, multiplication is not usefull for training, better use addition:

1. get a random integer number (for instance 6) (this is a bias to change the resulting number chain every time and force calculation, instead of knowing)
2. get a second integer number (for instance 13)
3. add the second number on top of the first number (19)
4. continue to add the second number on top of the result (6, 19, 32, 45, 58, 71, ...)

__4. Generation:__ never implemented :(

## How to run tests

    time make test

## What I learned

- the native power of ES6 with modules and namespaces in combination with web-components
- the advantages of using a state machine
- some clever tricks and nasty traps around SUI (Sound User Interface) design and creation
- the native power of modern browsers to support voice recognition and voice output
- the fun and power of user surveys in combination with common value creation
- there is a big difference between knowledge and mental arithmetic, so you need to train different
