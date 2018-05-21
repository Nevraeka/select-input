(function (document, window) {
  if (!window.customElements || !HTMLElement.prototype.attachShadow) {
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
    if (!window.customElements.get('text-input') && !window.customElements.get('option-list')) {
      loadAll();
    } else {
      if (!window.customElements.get('option-list') || !window.customElements.get('text-input')) {
        if (!window.customElements.get('option-list')) { loadOptionList(); }
        if (!window.customElements.get('text-input')) { loadTextInput(); }
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
    if (!window.customElements.get('select-input')) {
      window.customElements.define('select-input',
        class SelectInput extends HTMLElement {

          static get observedAttributes() { return []; }

          get info() { return Object.freeze({ dependencies: [{ "text-input": [{ "img-icon": [] }], "options-list": [] }], name: 'select-input', version: 'v0.2.3' }); }

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

  function render(elemInstance) {
    const optionsHTML = elemInstance.innerHTML;
    elemInstance.innerHTML = `
      <style>
        select-input {
          display: flex;
          flex-direction: column;
          width: auto;
        }
        .option_list__wrapper,
        .option_list__wrapper--hidden {
          width: 100%;
          position: static;
        }
        .option_list__wrapper--hidden {
          display: none;
        }
      </style>
      <text-input size="small" icon="arrowDropDown" is-valid="${elemInstance._state.isValid}" placeholder="${elemInstance._state.placeholder}"></text-input>
      <option-list max-select="${elemInstance._state.maxSelect}" class="option_list__wrapper--hidden" caret="top left">
        ${optionsHTML}
      </option-list>
    `;
    elemInstance.querySelector('text-input').addEventListener('textInputFocused', openHandler.bind(elemInstance));
    elemInstance.querySelector('option-list').addEventListener('optionSelected', closeHandler.bind(elemInstance));
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
    this.querySelector('text-input').setAttribute('icon', 'arrowDropUp');
    this._state.isOpen = true;
    this.dispatchEvent(selectInputOpenedEvent(this.querySelector('text-input').value));
    this.querySelector('option-list').classList.remove('option_list__wrapper--hidden');
  }

  function closeHandler(evt) {
    const target = this.querySelector('text-input');
    target.setValue(evt.detail.value);
    target.setAttribute('icon', 'arrowDropDown');
    this._state.isOpen = false;
    this.dispatchEvent(selectInputClosedEvent(target.value));
    this.querySelector('option-list').classList.add('option_list__wrapper--hidden');
  }

})(document, window);
