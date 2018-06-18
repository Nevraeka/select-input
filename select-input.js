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

    component.innerHTML = `
      <style>
        select-input {
          display: flex;
          flex-direction: column;
          width: auto;
          position: relative;
          z-index: 1;
        }
        .option_list__wrapper,
        .option_list__wrapper--hidden {
          width: 100%;
          position: absolute;
          top: 47px;
        }
        .option_list__wrapper--hidden {
          display: none;
        }
        .select_input__text_input input {
          cursor: pointer;
          user-select: none;
        }
        .select_input__text_input {
          background-color: #fff;
          border-radius: 4px;
        }
        
      </style>
      <text-input size="small" icon="arrowDropDown" class="select_input__text_input" is-valid="${component._state.isValid}" placeholder="${component._state.placeholder}"></text-input>
      <option-list class="option_list__wrapper--hidden" caret="top left">
        <slot></slot>
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
    const textInput = this.querySelector('text-input');
    textInput.setValue(filteredValue);
    textInput.setAttribute('icon', 'arrowDropDown');
    this._state.isOpen = false;
    this.dispatchEvent(selectInputClosedEvent(filteredValue));
    this.querySelector('option-list').classList.add('option_list__wrapper--hidden');
  }

})(document, window);
