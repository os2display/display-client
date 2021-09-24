# Templates

## How to create a template
The templates are created with react [remote component](https://github.com/Paciolan/remote-component).
The components that are loaded in the client should be compiled before. See https://github.com/os2display/display-templates
for how to compile templates.

### Obligatory

The client loads a compiled react component.
A component will be created like below

```html
<ExampleComponent
  slide="{slide}"
  slideDone="{slideDone}"
  content="{slide.content}"
  run="{run}"
/>
```

**slide**: The slide object.

**slideDone**: A function that is called when the slide is done.

**Content**: The slide content.

**Run**: A boolean that signals whether the slide is running or not.

The slide is responsible for signaling that it is done executing.
This is done by calling the slideDone() function.
If the slide should just run for X milliseconds then you can use the BaseSlideExecution class to handle this.
See the example below.

```javascript
/**
 * Setup slide run function.
 */
const slideExecution = new BaseSlideExecution(slide, slideDone);
useEffect(() => {
  if (run) {
    slideExecution.start(slide.duration);
  } else {
    slideExecution.stop();
  }

  return function cleanup() {
    slideExecution.stop();
  };
}, [run]);
```

#### JSON for backend form

To populate the slide with data an admin form is needed. This is configured in a json file:

**input**: _input | header | image | select | checkbox_
**name**: A name, should be unique
**type**: text, number or email.
**label**: Label for the input
**helpText**: A helptext for the input
**required**: whether it is required data
**formGroupClasses**: For styling, bootstrap, e.g. mb-3
**options**: an array of options {name,id} for the select

The following example is for the image and text template:

```json
[
  {
    "input": "header",
    "text": "Skabelon: Tekst og billede",
    "name": "header",
    "formGroupClasses": "h4 mb-3"
  },
  {
    "input": "header-h3",
    "text": "Indhold",
    "name": "header",
    "formGroupClasses": "h5 mb-3"
  },
  {
    "input": "input",
    "name": "title",
    "type": "text",
    "label": "Overskrift",
    "helpText": "Her kan du skrive slidets overskrift",
    "required": true,
    "formGroupClasses": "col-md-6 mb-3"
  },
  {
    "input": "input",
    "name": "text",
    "type": "text",
    "label": "Tekst på slide",
    "helpText": "Her kan du skrive teksten til slidet",
    "formGroupClasses": "col-md-6"
  },
  {
    "input": "image",
    "name": "image",
    "label": "Billede"
  },
  {
    "input": "header-h3",
    "text": "Opsætning",
    "name": "header",
    "formGroupClasses": "h5 mb-3"
  },
  {
    "input": "input",
    "name": "duration",
    "type": "number",
    "label": "Varighed",
    "helpText": "Her skal du skrive varigheden på slidet",
    "required": true,
    "formGroupClasses": "col-md-6 mb-3"
  },
  {
    "input": "select",
    "required": true,
    "label": "Hvor skal tekstboksen være placeret",
    "formGroupClasses": "col-md-6 mb-3",
    "options": [
      {
        "name": "Toppen",
        "id": "top"
      },
      {
        "name": "Højre",
        "id": "right"
      },
      {
        "name": "Bunden",
        "id": "bottom"
      },
      {
        "name": "Venstre",
        "id": "left"
      }
    ],
    "name": "box-align"
  },
  {
    "input": "checkbox",
    "label": "Margin rundt om tekst",
    "name": "text-margin",
    "formGroupClasses": "col-lg-3 mb-3"
  },
  {
    "input": "checkbox",
    "label": "Animeret tekst under overskrift",
    "name": "seperator",
    "formGroupClasses": "col-lg-3 mb-3"
  },
  {
    "input": "checkbox",
    "label": "Teksten optager højest 50% af skærmen",
    "name": "half_size",
    "formGroupClasses": "col-lg-3 mb-3"
  },
  {
    "input": "checkbox",
    "label": "Overskriften er under teksten",
    "helpText": "Denne kan ikke kombineres med den animerede tekst under overskriften",
    "name": "reversed",
    "formGroupClasses": "col-lg-3"
  }
]
```

### Considerations

- Consider size of the screen the template will be displayed on (todo write about the scaling we do)
