# Match-Bo


## Overview

Auto solver for **「マッチ一本だけ動かして、正しい式にしてください」**

https://dotnsf.github.io/matchbo


## How to play

- Input incorrect formula, and submit it.

- You will find corrected formulas, if exists.


## Rule

Based on [BS8 **クイズ!脳ベル SHOW**](https://www.bsfuji.tv/noubellshow/), you need to alter **valid** formula after you move **single** match.

You can **NOT** use &#x2260;("not-equal") symbol. You can use only following numbers and symbols in your answer.

You can check AI-generated quizs at https://dotnsf.github.io/matchbo?alpha=1

You can customize minor rules at https://dotnsf.github.io/matchbo?beta=1

You can check **daily** quizs at https://dotnsf.github.io/matchbo?gamma=1


### Numbers

![0](./docs/imgs/0.png)
![1](./docs/imgs/1.png)
![2](./docs/imgs/2.png)
![3](./docs/imgs/3.png)
![4](./docs/imgs/4.png)
![5](./docs/imgs/5.png)
![6](./docs/imgs/6.png)
![7](./docs/imgs/7.png)
![8](./docs/imgs/8.png)
![9](./docs/imgs/9.png)

### Symbols

![+](./docs/imgs/12.png)
![-](./docs/imgs/13.png)
![*](./docs/imgs/14.png)
![/](./docs/imgs/15.png)
![=](./docs/imgs/16.png)


## How to generate quizs

- `$ cd docs`

- `$ node generator [n]`

  - n: index(0-9)


## How to generate daily-quizs

- `$ cd docs`

- `$ node generator -1`


## Licensing

This code is licensed under MIT.


## Copyright

2020-2022  [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
