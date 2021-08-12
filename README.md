# DisplayClient

The display client for OS2Display ver. 2, currently a work in progress.

Currently, this is a create-react-app.

## Docker development setup

```
# Up the containers
docker-compose up -d

# Install npm packages
docker-compose run node bash -c 'npm install'

# Restart node
docker-compose restart node

# Follow the node logs to see when the code is compiled.
docker-compose logs -f node
```

The display client can opened at `http://display-client.local.itkdev.dk:3001/`.

The code is compiled when changed.

## Coding standards

For code analysis we use the [Airbnb style guide for javascript](https://github.com/airbnb/javascript) and for formatting we use [Prettier](https://github.com/prettier/prettier).

```
# Check for coding standards issues
docker-compose exec node bash -c 'npm run check-coding-standards'

# Auto-correct coding standards issues
docker-compose exec node bash -c 'npm run apply-coding-standards'
```

## Testing with cypress

We use [cypress](https://www.cypress.io/) for testing.

To run cypress tests in the cypress container:

```
docker-compose run cypress run
```

## Debug bar

The frontend has a debug bar, that allows for loading fixtures into the react app.
See the `public/fixtures` for the data fixtures.

## Build for production

Builds the app for production to the build folder.

@TODO: Add production build instructions.

## Event Model

![Event model](docs/EventModel.png)

## How to create a template (WIP - perhaps move this section to another place)

The templates are created with react ([remote component](https://github.com/Paciolan/remote-component)). The components that are loaded in the client should be compiled.

### Obligatory

The client loads a compiled react component.
A component will be created like below

```html
<ExampleComponent
  slideExecution={slideExecution}
  content={slide.content}
  run={run}
/>
```

**Content**: is the slide content.
**Run**: is a boolean whether the slide is running or not.
**slideExecution**: is an object, that starts/stops the slide.

And the following code snippet should be in the component:

```javascript
/**
 * Setup slide run function.
 */
useEffect(() => {
  if (run) {
    slideExecution.start();
  } else {
    slideExecution.stop();
  }

  return function cleanup() {
    slideExecution.stop();
  };
}, [run]);
```

The start function takes a parameter, duration, which replaces the duration defined on the slide. This can be useful in a situation where the slide shows videos.

#### JSON for backend form
If the template should be configured from the admin backend, it  needs a json file. As of now, the form is:

**input**: *input | header | image | select | checkbox*
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

### Optional

- Translations
- Test


### Considerations

- Consider size of the screen the template will be displayed on (todo write about the scaling we do)

