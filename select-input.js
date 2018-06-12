(function (document, window) {
  const ceReg = window.customElements;

  if (!ceReg || !HTMLElement.prototype.attachShadow) {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/webcomponents-sd-ce.js', loadComponents)
  } else {
    loadComponents();
  }

  function loadScript(url, callback) {
    const script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState === "loaded" || script.readyState === "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      script.onload = function () { callback() };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  function loadComponents() {
    const txtInput = ceReg.get('text-input');
    const optList = ceReg.get('option-list');
    if (!txtInput && !optList) {
      loadAll();
    } else {
      if (!optList || !txtInput) {
        if (!optList) { loadOptionList(); }
        if (!txtInput) { loadTextInput(); }
      } else {
        loadSelectInput();
      }
    }
  }

  function loadAll(callback) {
    loadScript('https://rawgit.com/Nevraeka/text-input/master/text-input.js', loadOptionList);
  }

  function loadTextInput() {
    loadScript('https://rawgit.com/Nevraeka/text-input/master/text-input.js', loadSelectInput);
  }

  function loadOptionList() {
    loadScript('https://rawgit.com/Nevraeka/option-list/master/option-list.js', loadSelectInput);
  }

  function loadSelectInput() {
    if (!ceReg.get('select-input')) {
      ceReg.define('select-input',
        class SelectInput extends HTMLElement {

          static get observedAttributes() { return []; }

          get info() { return Object.freeze({ dependencies: [{ "text-input": [{ "img-icon": [] }], "options-list": [] }], name: 'select-input', version: 'v0.4.0' }); }

          constructor() {
            super();
            this._state = {
              isOpen: false,
              placeholder: ''
            };
          }

          connectedCallback() { render(this); }

          attributeChangedCallback(name, oldValue, newValue) {
            if (newValue === oldValue) { return };
            this._state[name] = newValue;
            this._render();
          }

        });
    }
  }

  function render(component) {
    const optHTML = Array.from(component.children, (option) => {
      if (option && option.nodeType === 1) {
        option.innerHTML = `${option.innerHTML}<img-icon fill="100" shape="${(!!option.getAttribute('selected') ? 'checkmark' : '')}" class="select_input__img_icon"></img-icon>`;
      }
      return option;
    }).filter((opt) => !!opt);

    component.innerHTML = `
      <style>
        select-input {
          display: flex;
          flex-direction: column;
          width: auto;
        }
        .option_list__wrapper,
        .option_list__wrapper--hidden {
          width: 100%;
          position: relative;
          z-index: 9999;
        }
        .option_list__wrapper--hidden {
          display: none;
        }
        .select_input__text_input input {
          cursor: pointer;
          user-select: none;
          background-color: #fff;
          boder-radius: 4px;
        }
        .select_input__img_icon {
          margin: 0 0 0 auto;
          --img-icon--color: currentColor;  
        }
      </style>
      <text-input size="small" icon="arrowDropDown" class="select_input__text_input" is-valid="${component._state.isValid}" placeholder="${component._state.placeholder}"></text-input>
      <option-list max-select="${component._state.maxSelect}" class="option_list__wrapper--hidden" caret="top left">
        ${optHTML.map((op) => op.outerHTML).join('')}
      </option-list>
    `;

    component.querySelector('text-input').addEventListener('textInputFocused', openHandler.bind(component));
    component.querySelector('option-list').addEventListener('optionSelected', closeHandler.bind(component));
  }

  function selectInputClosedEvent(value) {
    return new CustomEvent('selectInputClosed', {
      composed: true,
      cancelable: true,
      detail: { value: value }
    });
  }

  function selectInputOpenedEvent(value) {
    return new CustomEvent('selectInputOpened', {
      composed: true,
      cancelable: true,
      detail: { value: value }
    });
  }

  function openHandler(evt) {
    const textInput = this.querySelector('text-input');
    textInput.setAttribute('icon', 'arrowDropUp');
    this._state.isOpen = true;
    this.dispatchEvent(selectInputOpenedEvent(textInput.value));
    this.querySelector('option-list').classList.remove('option_list__wrapper--hidden');
  }

  function closeHandler(evt) {
    const optList = this.querySelector('option-list');
    const textInput = this.querySelector('text-input');
    const filteredValue = evt.detail.value.replace(/(<img-icon.*\/img-icon>)/g, '');
    Array.from(optList.children, (opt) => {
      const optionIcon = opt.querySelector('img-icon');
      optionIcon.setAttribute('shape', '');
      if (opt.innerHTML === evt.detail.value) {
        optionIcon.setAttribute('shape', 'checkmark');
      }
    });
    textInput.setValue(filteredValue);
    textInput.setAttribute('icon', 'arrowDropDown');
    this._state.isOpen = false;
    this.dispatchEvent(selectInputClosedEvent(filteredValue));
    optList.classList.add('option_list__wrapper--hidden');
  }

})(document, window);
