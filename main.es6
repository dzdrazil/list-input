;(function(global) {
	'use strict';

	//
	// External Dependencies
	//
	var Kefir = global.Kefir;
	var vdom = global.virtualDom;


	class ListController {
		constructor(baseName) {
			this.baseName = baseName;
			this._values = [''];
			this._vdomChanges = Kefir.emitter();

			this.onDelete = this.onDelete.bind(this);
			this.onFocus = this.onFocus.bind(this);
			this.onChange = this.onChange.bind(this);
		}

		set values(data) {
			this._values = data;
			if (this._values[this._values.length -1] !== '') this._values.push('');
			this.render();
		}

		set name(name) {
			this.baseName = name;
			this.render();
		}

		getName(index) {
			return this.baseName + '[' + index + ']';
		}

		onDelete(e) {
			this.deleteIndex(
				parseInt(
					e.target.parentElement.getAttribute('data-index'), 10));
		}

		deleteIndex(i) {
			this._values.splice(i, 1);

			if (this._values.length === 0) this._values.push('');

			this.render();
		}

		onFocus(e) {
			if (e.target.value === '') return;

			this.focusIndex(
				parseInt(
					e.target.parentElement.getAttribute('data-index'), 10));
		}

		focusIndex(i) {
			if (i !== this._values.length -1) return;
			
			this._values.push('');
			this.render();
		}

		onChange(e) {
			if (e.target.tagName.toLowerCase() !== 'input') return;

			var value = e.target.value;
			var index = parseInt(
					e.target.parentElement.getAttribute('data-index'), 10);

			if (value === '') {
				this.deleteIndex(index);
				return;
			}
			else if (index === this._values.length -1) this._values.push('');
			
			this.change(index, value);
		}

		change(index, value) {
			this._values[index] = value;

			this.render();
		}

		render() {
			var newTree = _render(this.baseName, this._values, this);
			if (!this.tree) {
				this.tree = newTree;
				return;
			}

			this._vdomChanges.emit(vdom.diff(this.tree, newTree));
			this.tree = newTree;
		}
	}

	function _render(name, data, listController) {
		return vdom.h('div', data.map((value, index) => {
			return vdom.h('div', {attributes: {'data-index': index}, 'onkeyup': listController.onChange}, [
					vdom.h('label', {'for': listController.getName(index)}, listController.getName(index)),
					vdom.h('input', {value: value, name: listController.getName(index), 'onfocus': listController.onFocus}),
					vdom.h('button', {onclick: listController.onDelete}, 'x'),
					vdom.h('br')]);
		}));
	}

	/**
	 * @class ListInput
	 */
	class ListInput extends HTMLElement {
		get value() {
			return this._module._values;
		}

		create(name) {
			this._controller = new ListController(name);
			this._controller.render();
			this.appendChild(vdom.create(this._controller.tree));

			this._controller._vdomChanges
				.throttle(15)
				.onValue((diff) => vdom.patch(this.firstChild, diff));

			this.values = Kefir.emitter();
			this.values
				.onValue((data) => this._controller.values = data);
		}

		// LIFECYCLE CALLBACKS
		createdCallback() {
			this.create(this.getAttribute('name') || 'value');
		}

		attachedCallback() {
			var self = this;
			this._observer = new MutationObserver((changes) => {
				changes.forEach((change) => {
					self._controller[change.attributeName] = self.getAttribute(change.attributeName);
				});
			});
			this._observer.observe(this, { attributes: true, childList: false, characterData: false });
		}

		detachedCallback() {
			this._observer.disconnect();
			console.warn('todo: cleanup');
		}
	}

	global.document.registerElement('list-input', {
		prototype: ListInput.prototype
	});

})(this);
