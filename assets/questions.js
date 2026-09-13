/* Original practice set, aligned with the printable workbook. */
window.SQ_STAGES = [
  {
    "id": "start",
    "title": "はじめの8問",
    "description": "現在地を知る",
    "time": "5〜8分",
    "no": "01",
    "optional": false,
    "questions": [
      {
        "id": 1,
        "prompt": "49の平方根をすべて書こう。",
        "formula": "",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mn>7</mn></mrow></math>",
        "reason": "7²も (-7)²も49。正と負の2つです。",
        "hint": "「2乗すると49になる数」を探そう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>7</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>-</mo><mn>7</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><mn>9</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mn>7</mn></mrow></math>"
        ],
        "correct": 3
      },
      {
        "id": 2,
        "prompt": "次の値を求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>4</mn><mn>9</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>7</mn></mrow></math>",
        "reason": "√49 は正の平方根だけを表します。",
        "hint": "√の記号だけなら、正のほう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>-</mo><mn>7</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mn>4</mn><mn>.</mn><mn>5</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>7</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mn>7</mn></mrow></math>"
        ],
        "correct": 2
      },
      {
        "id": 3,
        "prompt": "ルートの中を簡単にしよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>8</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>8</mn></mrow></msqrt><mo>=</mo><msqrt><mrow><mn>9</mn><mo>×</mo><mn>2</mn></mrow></msqrt><mo>=</mo><mn>3</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "18に含まれる平方数は？",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>9</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>9</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><msqrt><mn>3</mn></msqrt></mrow></math>"
        ],
        "correct": 1
      },
      {
        "id": 4,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>6</mn></mrow></msqrt><mo>×</mo><msqrt><mrow><mn>3</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>6</mn></msqrt><msqrt><mn>3</mn></msqrt><mo>=</mo><msqrt><mrow><mn>1</mn><mn>8</mn></mrow></msqrt><mo>=</mo><mn>3</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "かけてから、平方数を取り出そう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>9</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn><mn>8</mn></mrow></math>"
        ],
        "correct": 0
      },
      {
        "id": 5,
        "prompt": "分母を有理化しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mn>1</mn></mrow><mrow><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></mfrac></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mrow><msqrt><mn>2</mn></msqrt></mrow></mfrac><mo>=</mo><mfrac><mrow><msqrt><mn>2</mn></msqrt></mrow><mrow><msqrt><mn>2</mn></msqrt><msqrt><mn>2</mn></msqrt></mrow></mfrac><mo>=</mo><mfrac><mrow><msqrt><mn>2</mn></msqrt></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>",
        "hint": "分母と分子に√2をかけよう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>2</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mn>2</mn></mfrac></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>"
        ],
        "correct": 3
      },
      {
        "id": 6,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>8</mn></mrow></msqrt><mo>+</mo><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>8</mn></msqrt><mo>+</mo><msqrt><mn>2</mn></msqrt><mo>=</mo><mn>2</mn><msqrt><mn>2</mn></msqrt><mo>+</mo><msqrt><mn>2</mn></msqrt><mo>=</mo><mn>3</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "先に√8を簡単にしよう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mrow><mn>2</mn></mrow></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt></mrow></math>"
        ],
        "correct": 2
      },
      {
        "id": 7,
        "prompt": "□に入る連続する整数を書こう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mstyle mathvariant=\"normal\"><mrow><mo>□</mo></mrow></mstyle><mo>&lt;</mo><msqrt><mrow><mn>2</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mstyle mathvariant=\"normal\"><mrow><mo>□</mo></mrow></mstyle></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><mo>&lt;</mo><msqrt><mrow><mn>2</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>5</mn></mrow></math>",
        "reason": "16 &lt; 20 &lt; 25 だから、4と5の間。",
        "hint": "20の前後にある平方数を探そう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>9</mn><mo>&lt;</mo><msqrt><mrow><mn>2</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>1</mn><mn>1</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><mo>&lt;</mo><msqrt><mrow><mn>2</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>5</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mo>&lt;</mo><msqrt><mrow><mn>2</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>4</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mo>&lt;</mo><msqrt><mrow><mn>2</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>6</mn></mrow></math>"
        ],
        "correct": 1
      },
      {
        "id": 8,
        "prompt": "無理数をすべて選ぼう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>9</mn></mrow></msqrt><mo>,</mo><mspace width=\"1em\"/><msqrt><mrow><mn>5</mn></mrow></msqrt><mo>,</mo><mspace width=\"1em\"/><mn>0</mn><mn>.</mn><mn>5</mn></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>5</mn></msqrt></mrow></math>",
        "reason": "√9 = 3、0.5 = 1/2 は有理数。",
        "hint": "整数や分数に直せるかな？",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>5</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>9</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn><mn>.</mn><mn>5</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>9</mn></msqrt><mo>,</mo><msqrt><mn>5</mn></msqrt></mrow></math>"
        ],
        "correct": 0
      }
    ]
  },
  {
    "id": "basic",
    "title": "基本の計算",
    "description": "平方数を見つけよう",
    "time": "10〜15分",
    "no": "02",
    "optional": false,
    "questions": [
      {
        "id": 9,
        "prompt": "16/25 の平方根をすべて書こう。",
        "formula": "",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mfrac><mn>4</mn><mn>5</mn></mfrac></mrow></math>",
        "reason": "(4/5)² も (-4/5)² も16/25。",
        "hint": "分子と分母の平方根を考えよう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 10,
        "prompt": "次の値を求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>0</mn><mn>.</mn><mn>8</mn><mn>1</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn><mn>.</mn><mn>9</mn></mrow></math>",
        "reason": "0.9 × 0.9 = 0.81。√の値は0以上。",
        "hint": "0.09では、2乗して0.81にならない。",
        "choices": [],
        "correct": null
      },
      {
        "id": 11,
        "prompt": "次の値を求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mo>(</mo><mo>-</mo><mn>6</mn><msup><mo>)</mo><mn>2</mn></msup></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mo>(</mo><mo>-</mo><mn>6</mn><msup><mo>)</mo><mn>2</mn></msup></mrow></msqrt><mo>=</mo><msqrt><mrow><mn>3</mn><mn>6</mn></mrow></msqrt><mo>=</mo><mn>6</mn></mrow></math>",
        "hint": "まずルートの中を計算しよう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 12,
        "prompt": "ルートの中を簡単にしよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>4</mn><mn>8</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>4</mn><mn>8</mn></mrow></msqrt><mo>=</mo><msqrt><mrow><mn>1</mn><mn>6</mn><mo>×</mo><mn>3</mn></mrow></msqrt><mo>=</mo><mn>4</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "hint": "48 = 16 × 3。",
        "choices": [],
        "correct": null
      },
      {
        "id": 13,
        "prompt": "ルートの中を簡単にしよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>7</mn><mn>5</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>7</mn><mn>5</mn></mrow></msqrt><mo>=</mo><msqrt><mrow><mn>2</mn><mn>5</mn><mo>×</mo><mn>3</mn></mrow></msqrt><mo>=</mo><mn>5</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "hint": "75 = 25 × 3。",
        "choices": [],
        "correct": null
      },
      {
        "id": 14,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>2</mn></mrow></msqrt><mo>×</mo><msqrt><mn>6</mn></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>2</mn></mrow></msqrt><msqrt><mn>6</mn></msqrt><mo>=</mo><msqrt><mrow><mn>7</mn><mn>2</mn></mrow></msqrt><mo>=</mo><mn>6</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "かけると√72。",
        "choices": [],
        "correct": null
      },
      {
        "id": 15,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>÷</mo><msqrt><mn>5</mn></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>6</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>÷</mo><msqrt><mn>5</mn></msqrt><mo>=</mo><msqrt><mrow><mn>3</mn><mn>0</mn><mo>/</mo><mn>5</mn></mrow></msqrt><mo>=</mo><msqrt><mn>6</mn></msqrt></mrow></math>",
        "hint": "ルートの中どうしを割ろう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 16,
        "prompt": "分母を有理化しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>3</mn><mrow><msqrt><mn>6</mn></msqrt></mrow></mfrac></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><msqrt><mn>6</mn></msqrt></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>3</mn><mrow><msqrt><mn>6</mn></msqrt></mrow></mfrac><mo>=</mo><mfrac><mrow><mn>3</mn><msqrt><mn>6</mn></msqrt></mrow><mrow><mn>6</mn></mrow></mfrac><mo>=</mo><mfrac><mrow><msqrt><mn>6</mn></msqrt></mrow><mrow><mn>2</mn></mrow></mfrac></mrow></math>",
        "hint": "有理化したあと、約分できる？",
        "choices": [],
        "correct": null
      }
    ]
  },
  {
    "id": "algebra",
    "title": "式の計算",
    "description": "同じルートをまとめる",
    "time": "10〜15分",
    "no": "03",
    "optional": false,
    "questions": [
      {
        "id": 17,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>2</mn></mrow></msqrt><mo>+</mo><msqrt><mrow><mn>2</mn><mn>7</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><msqrt><mn>3</mn></msqrt><mo>+</mo><mn>3</mn><msqrt><mn>3</mn></msqrt><mo>=</mo><mn>5</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "hint": "両方とも√3の仲間に直せる。",
        "choices": [],
        "correct": null
      },
      {
        "id": 18,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mn>8</mn></msqrt><mo>-</mo><msqrt><mrow><mn>1</mn><mn>8</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn><msqrt><mn>2</mn></msqrt><mo>-</mo><mn>3</mn><msqrt><mn>2</mn></msqrt><mo>=</mo><mn>3</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "3√8 の最初の3も忘れずに。",
        "choices": [],
        "correct": null
      },
      {
        "id": 19,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>3</mn></msqrt><mo>(</mo><msqrt><mrow><mn>1</mn><mn>2</mn></mrow></msqrt><mo>-</mo><mn>2</mn><mo>)</mo></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn><mo>-</mo><mn>2</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>3</mn><mn>6</mn></mrow></msqrt><mo>-</mo><mn>2</mn><msqrt><mn>3</mn></msqrt><mo>=</mo><mn>6</mn><mo>-</mo><mn>2</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "hint": "かっこの中の両方に√3をかけよう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 20,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>(</mo><msqrt><mn>5</mn></msqrt><mo>+</mo><msqrt><mn>2</mn></msqrt><msup><mo>)</mo><mn>2</mn></msup></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>7</mn><mo>+</mo><mn>2</mn><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mo>+</mo><mn>2</mn><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt><mo>+</mo><mn>2</mn><mo>=</mo><mn>7</mn><mo>+</mo><mn>2</mn><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt></mrow></math>",
        "hint": "(a+b)² = a² + 2ab + b²。",
        "choices": [],
        "correct": null
      },
      {
        "id": 21,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>(</mo><msqrt><mn>7</mn></msqrt><mo>+</mo><mn>2</mn><mo>)</mo><mo>(</mo><msqrt><mn>7</mn></msqrt><mo>-</mo><mn>2</mn><mo>)</mo></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
        "reason": "7-4=3",
        "hint": "(a+b)(a-b) = a² - b²。",
        "choices": [],
        "correct": null
      },
      {
        "id": 22,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><msqrt><mrow><mn>1</mn><mn>8</mn></mrow></msqrt><mo>+</mo><msqrt><mn>8</mn></msqrt></mrow><mrow><msqrt><mn>2</mn></msqrt></mrow></mfrac></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><mn>3</mn><msqrt><mn>2</mn></msqrt><mo>+</mo><mn>2</mn><msqrt><mn>2</mn></msqrt></mrow><mrow><msqrt><mn>2</mn></msqrt></mrow></mfrac><mo>=</mo><mfrac><mrow><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow><mrow><msqrt><mn>2</mn></msqrt></mrow></mfrac><mo>=</mo><mn>5</mn></mrow></math>",
        "hint": "分子をまとめてから割ってもOK。",
        "choices": [],
        "correct": null
      }
    ]
  },
  {
    "id": "apply",
    "title": "考える4問",
    "description": "基本を組み合わせよう",
    "time": "10〜15分",
    "no": "04",
    "optional": false,
    "questions": [
      {
        "id": 23,
        "prompt": "小さい順に並べよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mo>,</mo><mspace width=\"1em\"/><msqrt><mrow><mn>1</mn><mn>1</mn></mrow></msqrt><mo>,</mo><mspace width=\"1em\"/><mn>2</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mo>&lt;</mo><msqrt><mrow><mn>1</mn><mn>1</mn></mrow></msqrt><mo>&lt;</mo><mn>2</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mo>=</mo><msqrt><mn>9</mn></msqrt><mo>,</mo><mspace width=\"1em\"/><mn>2</mn><msqrt><mn>3</mn></msqrt><mo>=</mo><msqrt><mrow><mn>1</mn><mn>2</mn></mrow></msqrt></mrow></math>",
        "hint": "全部をルート1つで表して比べよう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 24,
        "prompt": "nは自然数。次を満たすnをすべて求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mo>&lt;</mo><msqrt><mi>n</mi></msqrt><mo>&lt;</mo><mn>4</mn></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>n</mi><mo>=</mo><mn>1</mn><mn>0</mn><mo>,</mo><mn>1</mn><mn>1</mn><mo>,</mo><mn>1</mn><mn>2</mn><mo>,</mo><mn>1</mn><mn>3</mn><mo>,</mo><mn>1</mn><mn>4</mn><mo>,</mo><mn>1</mn><mn>5</mn></mrow></math>",
        "reason": "両側を2乗して 9 &lt; n &lt; 16。9と16は含まない。",
        "hint": "3²と4²にはさまれる自然数は？",
        "choices": [],
        "correct": null
      },
      {
        "id": 25,
        "prompt": "√2 を約1.414として、近似値を求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>3</mn><mn>2</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mn>.</mn><mn>6</mn><mn>5</mn><mn>6</mn></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>3</mn><mn>2</mn></mrow></msqrt><mo>=</mo><mn>4</mn><msqrt><mn>2</mn></msqrt><mo> </mo><mo>⇒</mo><mo> </mo><mn>4</mn><mo>×</mo><mn>1</mn><mn>.</mn><mn>4</mn><mn>1</mn><mn>4</mn><mo>=</mo><mn>5</mn><mn>.</mn><mn>6</mn><mn>5</mn><mn>6</mn></mrow></math>",
        "hint": "√32を簡単にしてから代入しよう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 26,
        "prompt": "面積18 cm² の正方形の1辺と周の長さを求めよう。",
        "formula": "",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mn>2</mn></msqrt><mo> </mo><mstyle mathvariant=\"normal\"><mrow><mi>c</mi><mi>m</mi></mrow></mstyle><mo>,</mo><mspace width=\"1em\"/><mn>1</mn><mn>2</mn><msqrt><mn>2</mn></msqrt><mo> </mo><mstyle mathvariant=\"normal\"><mrow><mi>c</mi><mi>m</mi></mrow></mstyle></mrow></math>",
        "reason": "1辺は√18 = 3√2 cm。周はその4倍です。",
        "hint": "面積 = 1辺 × 1辺。周は4辺ぶん。",
        "choices": [],
        "correct": null
      }
    ]
  },
  {
    "id": "challenge",
    "title": "発展に挑戦",
    "description": "気になる1問から",
    "time": "10〜20分",
    "no": "05",
    "optional": true,
    "questions": [
      {
        "id": 27,
        "prompt": "次が自然数になる最小の自然数nを求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>4</mn><mn>8</mn><mi>n</mi></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>n</mi><mo>=</mo><mn>3</mn></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><mn>8</mn><mo>=</mo><msup><mn>4</mn><mn>2</mn></msup><mo>×</mo><mn>3</mn><mo>,</mo><mspace width=\"1em\"/><mn>4</mn><mn>8</mn><mo>×</mo><mn>3</mn><mo>=</mo><mn>1</mn><mn>4</mn><mn>4</mn><mo>=</mo><mn>1</mn><msup><mn>2</mn><mn>2</mn></msup></mrow></math>",
        "hint": "平方数のペアから余る素因数を探そう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 28,
        "prompt": "次が自然数になる自然数nをすべて求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>3</mn><mn>0</mn><mo>-</mo><mi>n</mi></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>n</mi><mo>=</mo><mn>5</mn><mo>,</mo><mn>1</mn><mn>4</mn><mo>,</mo><mn>2</mn><mn>1</mn><mo>,</mo><mn>2</mn><mn>6</mn><mo>,</mo><mn>2</mn><mn>9</mn></mrow></math>",
        "reason": "30-n が正の平方数。25,16,9,4,1 を30から引きます。",
        "hint": "0は自然数ではない。30-n は30未満。",
        "choices": [],
        "correct": null
      },
      {
        "id": 29,
        "prompt": "aは√10の整数部分。次の値を求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mrow><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt><mo>-</mo><mi>a</mi></mrow></mfrac><mo>-</mo><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>a</mi><mo>=</mo><mn>3</mn><mo>,</mo><mspace width=\"1em\"/><mfrac><mn>1</mn><mrow><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt><mo>-</mo><mn>3</mn></mrow></mfrac><mo>=</mo><mfrac><mrow><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt><mo>+</mo><mn>3</mn></mrow><mrow><mn>1</mn><mn>0</mn><mo>-</mo><mn>9</mn></mrow></mfrac></mrow></math>",
        "hint": "分母と分子に (√10+3) をかけよう。",
        "choices": [],
        "correct": null
      },
      {
        "id": 30,
        "prompt": "誤りを説明し、正しく計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>8</mn></msqrt><mo>+</mo><msqrt><mrow><mn>1</mn><mn>8</mn></mrow></msqrt><mo>=</mo><msqrt><mrow><mn>2</mn><mn>6</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>8</mn></msqrt><mo>+</mo><msqrt><mrow><mn>1</mn><mn>8</mn></mrow></msqrt><mo>=</mo><mn>2</mn><msqrt><mn>2</mn></msqrt><mo>+</mo><mn>3</mn><msqrt><mn>2</mn></msqrt><mo>=</mo><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "ルートの中を足す公式はあるかな？",
        "choices": [],
        "correct": null
      }
    ]
  },
  {
    "id": "finish",
    "title": "最後の8問",
    "description": "できた変化を見つける",
    "time": "5〜8分",
    "no": "06",
    "optional": false,
    "questions": [
      {
        "id": 31,
        "prompt": "64の平方根をすべて書こう。",
        "formula": "",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mn>8</mn></mrow></math>",
        "reason": "8² も (-8)² も64。",
        "hint": "正と負の両方。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mn>2</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mn>8</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>8</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>-</mo><mn>8</mn></mrow></math>"
        ],
        "correct": 1
      },
      {
        "id": 32,
        "prompt": "次の値を求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>6</mn><mn>4</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>8</mn></mrow></math>",
        "reason": "√64 は正の平方根。",
        "hint": "√の値は0以上。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>8</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mn>8</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>-</mo><mn>8</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><mn>2</mn></mrow></math>"
        ],
        "correct": 0
      },
      {
        "id": 33,
        "prompt": "ルートの中を簡単にしよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>5</mn><mn>0</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>5</mn><mn>0</mn></mrow></msqrt><mo>=</mo><msqrt><mrow><mn>2</mn><mn>5</mn><mo>×</mo><mn>2</mn></mrow></msqrt><mo>=</mo><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "25を取り出そう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><msqrt><mn>5</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><mn>5</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>"
        ],
        "correct": 3
      },
      {
        "id": 34,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt><mo>×</mo><msqrt><mn>5</mn></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>0</mn></mrow></msqrt><msqrt><mn>5</mn></msqrt><mo>=</mo><msqrt><mrow><mn>5</mn><mn>0</mn></mrow></msqrt><mo>=</mo><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "まず√50にしよう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn><mn>0</mn><msqrt><mn>5</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mn>0</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>5</mn></mrow></msqrt></mrow></math>"
        ],
        "correct": 2
      },
      {
        "id": 35,
        "prompt": "分母を有理化しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mrow><msqrt><mn>3</mn></msqrt></mrow></mfrac></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><msqrt><mn>3</mn></msqrt></mrow><mrow><mn>3</mn></mrow></mfrac></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mrow><msqrt><mn>3</mn></msqrt></mrow></mfrac><mo>=</mo><mfrac><mrow><msqrt><mn>3</mn></msqrt></mrow><mrow><mn>3</mn></mrow></mfrac></mrow></math>",
        "hint": "上下に√3をかけよう。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><msqrt><mn>3</mn></msqrt></mrow><mrow><mn>3</mn></mrow></mfrac></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>3</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mn>3</mn></mfrac></mrow></math>"
        ],
        "correct": 1
      },
      {
        "id": 36,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>2</mn><mn>7</mn></mrow></msqrt><mo>+</mo><msqrt><mn>3</mn></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mn>3</mn></msqrt><mo>+</mo><msqrt><mn>3</mn></msqrt><mo>=</mo><mn>4</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
        "hint": "√27を簡単に。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mn>3</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>9</mn></mrow></math>"
        ],
        "correct": 0
      },
      {
        "id": 37,
        "prompt": "□に入る連続する整数を書こう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mstyle mathvariant=\"normal\"><mrow><mo>□</mo></mrow></mstyle><mo>&lt;</mo><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mstyle mathvariant=\"normal\"><mrow><mo>□</mo></mrow></mstyle></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mo>&lt;</mo><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>6</mn></mrow></math>",
        "reason": "25 &lt; 30 &lt; 36。",
        "hint": "前後の平方数は25と36。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>4</mn><mo>&lt;</mo><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>5</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn><mo>&lt;</mo><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>7</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>1</mn><mn>4</mn><mo>&lt;</mo><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>1</mn><mn>6</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn><mo>&lt;</mo><msqrt><mrow><mn>3</mn><mn>0</mn></mrow></msqrt><mo>&lt;</mo><mn>6</mn></mrow></math>"
        ],
        "correct": 3
      },
      {
        "id": 38,
        "prompt": "無理数をすべて選ぼう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>6</mn></mrow></msqrt><mo>,</mo><mspace width=\"1em\"/><msqrt><mn>6</mn></msqrt><mo>,</mo><mspace width=\"1em\"/><mn>0</mn><mn>.</mn><mn>7</mn><mn>5</mn></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>6</mn></msqrt></mrow></math>",
        "reason": "√16 = 4、0.75 = 3/4 は有理数。",
        "hint": "整数や分数に直せるか確認。",
        "choices": [
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>0</mn><mn>.</mn><mn>7</mn><mn>5</mn></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>6</mn></mrow></msqrt><mo>,</mo><msqrt><mn>6</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>6</mn></msqrt></mrow></math>",
          "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>6</mn></mrow></msqrt></mrow></math>"
        ],
        "correct": 2
      }
    ]
  },
  {
    "id": "retry",
    "title": "もう一度",
    "description": "迷った型だけ再挑戦",
    "time": "5〜8分",
    "no": "07",
    "optional": true,
    "questions": [
      {
        "id": 39,
        "prompt": "25の平方根をすべて書こう。",
        "formula": "",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mo>±</mo><mn>5</mn></mrow></math>",
        "reason": "5²も (-5)²も25。",
        "hint": "正と負の両方。",
        "choices": [],
        "correct": null
      },
      {
        "id": 40,
        "prompt": "次の値を求めよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>2</mn><mn>5</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>5</mn></mrow></math>",
        "reason": "√25 は正の平方根。",
        "hint": "√の意味を確認。",
        "choices": [],
        "correct": null
      },
      {
        "id": 41,
        "prompt": "ルートの中を簡単にしよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>9</mn><mn>8</mn></mrow></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>7</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>9</mn><mn>8</mn></mrow></msqrt><mo>=</mo><msqrt><mrow><mn>4</mn><mn>9</mn><mo>×</mo><mn>2</mn></mrow></msqrt><mo>=</mo><mn>7</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "98 = 49 × 2。",
        "choices": [],
        "correct": null
      },
      {
        "id": 42,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>4</mn></mrow></msqrt><mo>×</mo><msqrt><mn>7</mn></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>7</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>1</mn><mn>4</mn></mrow></msqrt><msqrt><mn>7</mn></msqrt><mo>=</mo><msqrt><mrow><mn>9</mn><mn>8</mn></mrow></msqrt><mo>=</mo><mn>7</mn><msqrt><mn>2</mn></msqrt></mrow></math>",
        "hint": "かけてから整理。",
        "choices": [],
        "correct": null
      },
      {
        "id": 43,
        "prompt": "分母を有理化しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mrow><msqrt><mn>5</mn></msqrt></mrow></mfrac></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mrow><msqrt><mn>5</mn></msqrt></mrow><mrow><mn>5</mn></mrow></mfrac></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mfrac><mn>1</mn><mrow><msqrt><mn>5</mn></msqrt></mrow></mfrac><mo>=</mo><mfrac><mrow><msqrt><mn>5</mn></msqrt></mrow><mrow><mn>5</mn></mrow></mfrac></mrow></math>",
        "hint": "上下に√5をかける。",
        "choices": [],
        "correct": null
      },
      {
        "id": 44,
        "prompt": "計算しよう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>2</mn><mn>0</mn></mrow></msqrt><mo>+</mo><msqrt><mn>5</mn></msqrt></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>3</mn><msqrt><mn>5</mn></msqrt></mrow></math>",
        "reason": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>2</mn><msqrt><mn>5</mn></msqrt><mo>+</mo><msqrt><mn>5</mn></msqrt><mo>=</mo><mn>3</mn><msqrt><mn>5</mn></msqrt></mrow></math>",
        "hint": "√20を簡単に。",
        "choices": [],
        "correct": null
      },
      {
        "id": 45,
        "prompt": "□に入る連続する整数を書こう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mstyle mathvariant=\"normal\"><mrow><mo>□</mo></mrow></mstyle><mo>&lt;</mo><msqrt><mrow><mn>4</mn><mn>5</mn></mrow></msqrt><mo>&lt;</mo><mstyle mathvariant=\"normal\"><mrow><mo>□</mo></mrow></mstyle></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mn>6</mn><mo>&lt;</mo><msqrt><mrow><mn>4</mn><mn>5</mn></mrow></msqrt><mo>&lt;</mo><mn>7</mn></mrow></math>",
        "reason": "36 &lt; 45 &lt; 49。",
        "hint": "前後の平方数は36と49。",
        "choices": [],
        "correct": null
      },
      {
        "id": 46,
        "prompt": "無理数をすべて選ぼう。",
        "formula": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mrow><mn>2</mn><mn>5</mn></mrow></msqrt><mo>,</mo><mspace width=\"1em\"/><msqrt><mn>7</mn></msqrt><mo>,</mo><mspace width=\"1em\"/><mn>0</mn><mn>.</mn><mn>2</mn></mrow></math>",
        "answer": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msqrt><mn>7</mn></msqrt></mrow></math>",
        "reason": "√25 = 5、0.2 = 1/5 は有理数。",
        "hint": "整数や分数に直せるか確認。",
        "choices": [],
        "correct": null
      }
    ]
  }
];
