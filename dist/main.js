"use strict";

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

;(function (global) {
  "use strict";

  var _render = function (name, data, listController) {
    return vdom.h("div", data.map(function (value, index) {
      return vdom.h("div", { attributes: { "data-index": index }, onkeyup: listController.onChange }, [vdom.h("label", { "for": listController.getName(index) }, listController.getName(index)), vdom.h("input", { value: value, name: listController.getName(index), onfocus: listController.onFocus }), vdom.h("button", { onclick: listController.onDelete }, "x"), vdom.h("br")]);
    }));
  };

  //
  // External Dependencies
  //
  var Kefir = global.Kefir;
  var vdom = global.virtualDom;


  var ListController = (function () {
    function ListController(baseName) {
      this.baseName = baseName;
      this._values = [""];
      this._vdomChanges = Kefir.emitter();

      this.onDelete = this.onDelete.bind(this);
      this.onFocus = this.onFocus.bind(this);
      this.onChange = this.onChange.bind(this);
    }

    _prototypeProperties(ListController, null, {
      values: {
        set: function (data) {
          this._values = data;
          if (this._values[this._values.length - 1] !== "") this._values.push("");
          this.render();
        },
        enumerable: true,
        configurable: true
      },
      name: {
        set: function (name) {
          this.baseName = name;
          this.render();
        },
        enumerable: true,
        configurable: true
      },
      getName: {
        value: function getName(index) {
          return this.baseName + "[" + index + "]";
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      onDelete: {
        value: function onDelete(e) {
          this.deleteIndex(parseInt(e.target.parentElement.getAttribute("data-index"), 10));
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      deleteIndex: {
        value: function deleteIndex(i) {
          this._values.splice(i, 1);

          if (this._values.length === 0) this._values.push("");

          this.render();
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      onFocus: {
        value: function onFocus(e) {
          if (e.target.value === "") return;

          this.focusIndex(parseInt(e.target.parentElement.getAttribute("data-index"), 10));
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      focusIndex: {
        value: function focusIndex(i) {
          if (i !== this._values.length - 1) return;

          this._values.push("");
          this.render();
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      onChange: {
        value: function onChange(e) {
          if (e.target.tagName.toLowerCase() !== "input") return;

          var value = e.target.value;
          var index = parseInt(e.target.parentElement.getAttribute("data-index"), 10);

          if (value === "") {
            this.deleteIndex(index);
            return;
          } else if (index === this._values.length - 1) this._values.push("");

          this.change(index, value);
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      change: {
        value: function change(index, value) {
          this._values[index] = value;

          this.render();
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      render: {
        value: function render() {
          var newTree = _render(this.baseName, this._values, this);
          if (!this.tree) {
            this.tree = newTree;
            return;
          }

          this._vdomChanges.emit(vdom.diff(this.tree, newTree));
          this.tree = newTree;
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });

    return ListController;
  })();

  /**
   * @class ListInput
   */
  var ListInput = (function (HTMLElement) {
    function ListInput() {
      if (Object.getPrototypeOf(ListInput) !== null) {
        Object.getPrototypeOf(ListInput).apply(this, arguments);
      }
    }

    _inherits(ListInput, HTMLElement);

    _prototypeProperties(ListInput, null, {
      value: {
        get: function () {
          return this._module._values;
        },
        enumerable: true,
        configurable: true
      },
      create: {
        value: function create(name) {
          var _this = this;
          this._controller = new ListController(name);
          this._controller.render();
          this.appendChild(vdom.create(this._controller.tree));

          this._controller._vdomChanges.throttle(15).onValue(function (diff) {
            return vdom.patch(_this.firstChild, diff);
          });

          this.values = Kefir.emitter();
          this.values.onValue(function (data) {
            return _this._controller.values = data;
          });
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      createdCallback: {

        // LIFECYCLE CALLBACKS
        value: function createdCallback() {
          this.create(this.getAttribute("name") || "value");
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      attachedCallback: {
        value: function attachedCallback() {
          var self = this;
          this._observer = new MutationObserver(function (changes) {
            changes.forEach(function (change) {
              self._controller[change.attributeName] = self.getAttribute(change.attributeName);
            });
          });
          this._observer.observe(this, { attributes: true, childList: false, characterData: false });
        },
        writable: true,
        enumerable: true,
        configurable: true
      },
      detachedCallback: {
        value: function detachedCallback() {
          this._observer.disconnect();
          console.warn("todo: cleanup");
        },
        writable: true,
        enumerable: true,
        configurable: true
      }
    });

    return ListInput;
  })(HTMLElement);

  global.document.registerElement("list-input", {
    prototype: ListInput.prototype
  });
})(this);
