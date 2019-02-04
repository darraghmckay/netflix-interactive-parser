# netflix-interactive-parser

Javascript library for a simple reverse engineering of Netflix's interactive content using Netlix's raw data.

It can be used to navigate through the content's interactive moments while maintaining preconditions and state. 

Starting with the initial _choice_, the next choice is calculated based on the chosen choice and the state history and any preconditions

[Demo](https://darraghmckay.github.io/netflix-interactive-parser/)

### Instalation

Using npm
```
npm i netflix-interactive-parser
```

Using yarn
```
yarn add netflix-interactive-parser
```

### Usage / Example

```js
import NetflixInteractiveParser from 'netflix-interactive-parser';

const parser = new NetflixInteractiveParser(rawData, segmentMap);

const choiceState = parser.getInitialChoices();

const nextChoiceState = parser.getNextChoices(choiceState.choices[0]);

```


### Reference

`rawData` is the data extracted from Netflix at the start of the video - [example](https://github.com/darraghmckay/netflix-interactive-parser/blob/master/demo/src/data/bandersnatch.js)

`segmentMap` is similar but it is a map of the segments in the film/video - [example](https://github.com/darraghmckay/netflix-interactive-parser/blob/master/demo/src/data/segmentMap.js)

#### getInitialChoices() 

Returns
```js
{
  "choices": [
    {
      "id": "1E",
      "segmentId": "1E",
      "startTimeMs": 153520,
      "text": "SUGAR PUFFS"
    },
    {
      "id": "1D",
      "segmentId": "1D",
      "startTimeMs": 5442480,
      "text": "FROSTIES"
    }
  ],
  "choicePoint": {
    "choices": [
      "1E",
      "1D"
    ],
    "startTimeMs": 129520,
    "description": "Which Cereal?",
    "image": {
      "styles": {
        "backgroundImage": "url(https:\/\/assets.nflxext.com\/ffe\/oui\/interactive\/bs\/playercontrols\/web\/2018125\/8de17b55e40c28643ac50c94b72d41160ef90324e58c44ae94a26f5ad98901f7.webp)",
        "backgroundSize": "100%"
      }
    }
  },
  "layoutType": "l2",
  "segmentId": "1A",
  "selected": {
    "id": "1E",
    "segmentId": "1E",
    "startTimeMs": 153520,
    "text": "SUGAR PUFFS"
  }
}
```

#### getNextChoices(choice)

Where choice looks like:

```js
{
  "id": "1E",
  "segmentId": "1E",
  "startTimeMs": 153520,
  "text": "SUGAR PUFFS"
}
``` 


## Known Issues
[] There are situations where no choice/segment is found even though it's not certainly the end of the path
[] Returning the choices for different layouts, such as the code input in bandersnatch doesn't seem to work

This was only tested against the bandersnatch data but in theory should work for all of Netflix's interactive content
