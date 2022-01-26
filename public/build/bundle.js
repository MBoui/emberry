
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    var t=function(n,e){return (t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n;}||function(t,n){for(var e in n)Object.prototype.hasOwnProperty.call(n,e)&&(t[e]=n[e]);})(n,e)};function n$1(n,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function r(){this.constructor=n;}t(n,e),n.prototype=null===e?Object.create(e):(r.prototype=e.prototype,new r);}var e=function(){return (e=Object.assign||function(t){for(var n,e=1,r=arguments.length;e<r;e++)for(var o in n=arguments[e])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)};function r$1(t,n,e,r){return new(e||(e=Promise))((function(o,a){function i(t){try{u(r.next(t));}catch(t){a(t);}}function c(t){try{u(r.throw(t));}catch(t){a(t);}}function u(t){var n;t.done?o(t.value):(n=t.value,n instanceof e?n:new e((function(t){t(n);}))).then(i,c);}u((r=r.apply(t,n||[])).next());}))}function o$1(t,n){var e,r,o,a,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function c(a){return function(c){return function(a){if(e)throw new TypeError("Generator is already executing.");for(;i;)try{if(e=1,r&&(o=2&a[0]?r.return:a[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,a[1])).done)return o;switch(r=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,r=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(o=i.trys,(o=o.length>0&&o[o.length-1])||6!==a[0]&&2!==a[0])){i=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){i.label=a[1];break}if(6===a[0]&&i.label<o[1]){i.label=o[1],o=a;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(a);break}o[2]&&i.ops.pop(),i.trys.pop();continue}a=n.call(t,i);}catch(t){a=[6,t],r=0;}finally{e=o=0;}if(5&a[0])throw a[1];return {value:a[0]?a[1]:void 0,done:!0}}([a,c])}}}function a(t,n){void 0===n&&(n=!1);var e=function(){var t=new Int8Array(1);window.crypto.getRandomValues(t);var n=new Uint8Array(Math.max(16,Math.abs(t[0])));return window.crypto.getRandomValues(n),n.join("")}();return Object.defineProperty(window,e,{value:function(r){return n&&Reflect.deleteProperty(window,e),null==t?void 0:t(r)},writable:!1,configurable:!0}),e}function i(t,n){return void 0===n&&(n={}),r$1(this,void 0,void 0,(function(){return o$1(this,(function(r){return [2,new Promise((function(r,o){var i=a((function(t){r(t),Reflect.deleteProperty(window,c);}),!0),c=a((function(t){o(t),Reflect.deleteProperty(window,i);}),!0);window.rpc.notify(t,e({__invokeKey:__TAURI_INVOKE_KEY__,callback:i,error:c},n));}))]}))}))}function c$2(t){return navigator.userAgent.includes("Windows")?"https://asset.localhost/"+t:"asset://"+t}Object.freeze({__proto__:null,transformCallback:a,invoke:i,convertFileSrc:c$2});

    function n(n){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(i$1){return [2,i("tauri",n)]}))}))}

    function r(i,r,u){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){switch(t.label){case 0:return [4,n({__tauriModule:"Event",message:{cmd:"emit",event:i,windowLabel:r,payload:u}})];case 1:return t.sent(),[2]}}))}))}function u(i){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Event",message:{cmd:"unlisten",eventId:i}})]}))}))}function o(r,o){return r$1(this,void 0,void 0,(function(){var s=this;return o$1(this,(function(c){return [2,n({__tauriModule:"Event",message:{cmd:"listen",event:r,handler:a(o)}}).then((function(i){return function(){return r$1(s,void 0,void 0,(function(){return o$1(this,(function(t){return [2,u(i)]}))}))}}))]}))}))}function s$1(i,e){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,o(i,(function(t){e(t),u(t.id).catch((function(){}));}))]}))}))}function c$1(i,e){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,r(i,void 0,e)]}))}))}Object.freeze({__proto__:null,listen:o,once:s$1,emit:c$1});

    var s,d=function(t,e){this.type="Logical",this.width=t,this.height=e;},l=function(){function t(t,e){this.type="Physical",this.width=t,this.height=e;}return t.prototype.toLogical=function(t){return new d(this.width/t,this.height/t)},t}(),c=function(t,e){this.type="Logical",this.x=t,this.y=e;},h=function(){function t(t,e){this.type="Physical",this.x=t,this.y=e;}return t.prototype.toLogical=function(t){return new c(this.x/t,this.y/t)},t}();function m(){return new v(window.__TAURI__.__currentWindow.label,{skip:!0})}function p(){return window.__TAURI__.__windows.map((function(t){return new v(t.label,{skip:!0})}))}!function(t){t[t.Critical=1]="Critical",t[t.Informational=2]="Informational";}(s||(s={}));var f=["tauri://created","tauri://error"],y=function(){function t(t){this.label=t,this.listeners=Object.create(null);}return t.prototype.listen=function(t,n){return r$1(this,void 0,void 0,(function(){var e=this;return o$1(this,(function(i){return this._handleTauriEvent(t,n)?[2,Promise.resolve((function(){var i=e.listeners[t];i.splice(i.indexOf(n),1);}))]:[2,o(t,n)]}))}))},t.prototype.once=function(t,n){return r$1(this,void 0,void 0,(function(){var e=this;return o$1(this,(function(i){return this._handleTauriEvent(t,n)?[2,Promise.resolve((function(){var i=e.listeners[t];i.splice(i.indexOf(n),1);}))]:[2,s$1(t,n)]}))}))},t.prototype.emit=function(t,n){return r$1(this,void 0,void 0,(function(){var e,o;return o$1(this,(function(i){if(f.includes(t)){for(e=0,o=this.listeners[t]||[];e<o.length;e++)(0, o[e])({event:t,id:-1,payload:n});return [2,Promise.resolve()]}return [2,r(t,this.label,n)]}))}))},t.prototype._handleTauriEvent=function(t,e){return !!f.includes(t)&&(t in this.listeners?this.listeners[t].push(e):this.listeners[t]=[e],!0)},t}(),g=function(n$2){function r(){return null!==n$2&&n$2.apply(this,arguments)||this}return n$1(r,n$2),r.prototype.scaleFactor=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"scaleFactor"}}}})]}))}))},r.prototype.innerPosition=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerPosition"}}}})]}))}))},r.prototype.outerPosition=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerPosition"}}}})]}))}))},r.prototype.innerSize=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"innerSize"}}}})]}))}))},r.prototype.outerSize=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"outerSize"}}}})]}))}))},r.prototype.isFullscreen=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isFullscreen"}}}})]}))}))},r.prototype.isMaximized=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isMaximized"}}}})]}))}))},r.prototype.isDecorated=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isDecorated"}}}})]}))}))},r.prototype.isResizable=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isResizable"}}}})]}))}))},r.prototype.isVisible=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"isVisible"}}}})]}))}))},r.prototype.center=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"center"}}}})]}))}))},r.prototype.requestUserAttention=function(t){return r$1(this,void 0,void 0,(function(){var e;return o$1(this,(function(i){return e=null,t&&(e=t===s.Critical?{type:"Critical"}:{type:"Informational"}),[2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"requestUserAttention",payload:e}}}})]}))}))},r.prototype.setResizable=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setResizable",payload:t}}}})]}))}))},r.prototype.setTitle=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setTitle",payload:t}}}})]}))}))},r.prototype.maximize=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"maximize"}}}})]}))}))},r.prototype.unmaximize=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unmaximize"}}}})]}))}))},r.prototype.toggleMaximize=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"toggleMaximize"}}}})]}))}))},r.prototype.minimize=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"minimize"}}}})]}))}))},r.prototype.unminimize=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"unminimize"}}}})]}))}))},r.prototype.show=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"show"}}}})]}))}))},r.prototype.hide=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"hide"}}}})]}))}))},r.prototype.close=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"close"}}}})]}))}))},r.prototype.setDecorations=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setDecorations",payload:t}}}})]}))}))},r.prototype.setAlwaysOnTop=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setAlwaysOnTop",payload:t}}}})]}))}))},r.prototype.setSize=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSize",payload:{type:t.type,data:{width:t.width,height:t.height}}}}}})]}))}))},r.prototype.setMinSize=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMinSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},r.prototype.setMaxSize=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){if(t&&"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `size` argument must be either a LogicalSize or a PhysicalSize instance");return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setMaxSize",payload:t?{type:t.type,data:{width:t.width,height:t.height}}:null}}}})]}))}))},r.prototype.setPosition=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){if(!t||"Logical"!==t.type&&"Physical"!==t.type)throw new Error("the `position` argument must be either a LogicalPosition or a PhysicalPosition instance");return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setPosition",payload:{type:t.type,data:{x:t.x,y:t.y}}}}}})]}))}))},r.prototype.setFullscreen=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFullscreen",payload:t}}}})]}))}))},r.prototype.setFocus=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setFocus"}}}})]}))}))},r.prototype.setIcon=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setIcon",payload:{icon:t}}}}})]}))}))},r.prototype.setSkipTaskbar=function(t){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(e){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"setSkipTaskbar",payload:t}}}})]}))}))},r.prototype.startDragging=function(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{label:this.label,cmd:{type:"startDragging"}}}})]}))}))},r}(y),v=function(r){function a(t,a){void 0===a&&(a={});var u=r.call(this,t)||this;return (null==a?void 0:a.skip)||n({__tauriModule:"Window",message:{cmd:"createWebview",data:{options:e({label:t},a)}}}).then((function(){return r$1(u,void 0,void 0,(function(){return o$1(this,(function(t){return [2,this.emit("tauri://created")]}))}))})).catch((function(t){return r$1(u,void 0,void 0,(function(){return o$1(this,(function(e){return [2,this.emit("tauri://error",t)]}))}))})),u}return n$1(a,r),a.getByLabel=function(t){return p().some((function(e){return e.label===t}))?new a(t,{skip:!0}):null},a}(g),b=new v(null,{skip:!0});function _(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"currentMonitor"}}}})]}))}))}function w(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"primaryMonitor"}}}})]}))}))}function M(){return r$1(this,void 0,void 0,(function(){return o$1(this,(function(t){return [2,n({__tauriModule:"Window",message:{cmd:"manage",data:{cmd:{type:"availableMonitors"}}}})]}))}))}Object.freeze({__proto__:null,WebviewWindow:v,WebviewWindowHandle:y,WindowManager:g,getCurrent:m,getAll:p,appWindow:b,LogicalSize:d,PhysicalSize:l,LogicalPosition:c,PhysicalPosition:h,get UserAttentionType(){return s},currentMonitor:_,primaryMonitor:w,availableMonitors:M});

    /* src\win\Titlebar.svelte generated by Svelte v3.46.3 */
    const file$1 = "src\\win\\Titlebar.svelte";

    // (41:12) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "transform", "scale(.26458)");
    			attr_dev(path0, "d", "m3 6v11h11v-11h-11zm1 1h9v9h-9v-9z");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "stroke-dashoffset", "44.5");
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-width", "1.4385");
    			set_style(path0, "paint-order", "markers fill stroke");
    			add_location(path0, file$1, 42, 20, 1776);
    			attr_dev(path1, "transform", "scale(.26458)");
    			attr_dev(path1, "d", "m6 3v4h1v-3h9v9h-3v1h4v-11h-11z");
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "stroke-dashoffset", "44.5");
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-width", "1.4385");
    			set_style(path1, "paint-order", "markers fill stroke");
    			add_location(path1, file$1, 43, 20, 2000);
    			attr_dev(svg, "width", "13.5");
    			attr_dev(svg, "height", "13.5");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 5.2917 5.2917");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$1, 41, 16, 1645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(41:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:12) {#if !isMaximized}
    function create_if_block(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "m0.79374 0.79374v3.7041h3.7041v-3.7041zm0.26458 0.26458h3.175v3.175h-3.175z");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "stroke-width", ".26458");
    			set_style(path, "paint-order", "markers fill stroke");
    			add_location(path, file$1, 38, 20, 1413);
    			attr_dev(svg, "width", "13.5");
    			attr_dev(svg, "height", "13.5");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 5.2917 5.2917");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$1, 37, 16, 1282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(37:12) {#if !isMaximized}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let div4;
    	let div1;
    	let svg0;
    	let rect0;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let svg1;
    	let rect1;
    	let rect2;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*isMaximized*/ ctx[1]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			rect0 = svg_element("rect");
    			t1 = space();
    			div2 = element("div");
    			if_block.c();
    			t2 = space();
    			div3 = element("div");
    			svg1 = svg_element("svg");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			attr_dev(div0, "class", "tabs svelte-n0gyou");
    			attr_dev(div0, "data-tauri-drag-region", "true");
    			add_location(div0, file$1, 23, 4, 739);
    			attr_dev(rect0, "x", ".7938");
    			attr_dev(rect0, "y", "2.5135");
    			attr_dev(rect0, "width", "3.7042");
    			attr_dev(rect0, "height", ".26458");
    			attr_dev(rect0, "fill", "currentColor");
    			set_style(rect0, "paint-order", "markers fill stroke");
    			add_location(rect0, file$1, 31, 16, 1025);
    			attr_dev(svg0, "width", "13.5");
    			attr_dev(svg0, "height", "15");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "viewBox", "0 0 5.2917 5.2917");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$1, 30, 12, 900);
    			attr_dev(div1, "class", "button svelte-n0gyou");
    			add_location(div1, file$1, 29, 8, 846);
    			attr_dev(div2, "class", "button svelte-n0gyou");
    			add_location(div2, file$1, 35, 8, 1192);
    			attr_dev(rect1, "transform", "matrix(.7071 .70711 -.7071 .70711 0 0)");
    			attr_dev(rect1, "x", "3.6093");
    			attr_dev(rect1, "y", "-2.4322");
    			attr_dev(rect1, "width", ".26458");
    			attr_dev(rect1, "height", "4.8643");
    			attr_dev(rect1, "fill", "currentColor");
    			set_style(rect1, "paint-order", "markers fill stroke");
    			add_location(rect1, file$1, 50, 16, 2450);
    			attr_dev(rect2, "transform", "matrix(-.7071 .70711 .7071 .70711 0 0)");
    			attr_dev(rect2, "x", "-.13227");
    			attr_dev(rect2, "y", "1.3095");
    			attr_dev(rect2, "width", ".26458");
    			attr_dev(rect2, "height", "4.8643");
    			attr_dev(rect2, "fill", "currentColor");
    			set_style(rect2, "paint-order", "markers fill stroke");
    			add_location(rect2, file$1, 51, 16, 2640);
    			attr_dev(svg1, "width", "14");
    			attr_dev(svg1, "height", "14");
    			attr_dev(svg1, "version", "1.1");
    			attr_dev(svg1, "viewBox", "0 0 5.2917 5.2917");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$1, 49, 12, 2327);
    			attr_dev(div3, "class", "button-close svelte-n0gyou");
    			add_location(div3, file$1, 48, 8, 2270);
    			attr_dev(div4, "class", "decorations svelte-n0gyou");
    			add_location(div4, file$1, 27, 4, 809);
    			attr_dev(div5, "class", "titlebar svelte-n0gyou");
    			attr_dev(div5, "focus", /*isFocused*/ ctx[0]);
    			add_location(div5, file$1, 21, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, rect0);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			if_block.m(div2, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, svg1);
    			append_dev(svg1, rect1);
    			append_dev(svg1, rect2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*minimize*/ ctx[2], false, false, false),
    					listen_dev(div2, "click", /*maximize*/ ctx[3], false, false, false),
    					listen_dev(div3, "click", /*close*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}

    			if (dirty & /*isFocused*/ 1) {
    				attr_dev(div5, "focus", /*isFocused*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Titlebar', slots, []);
    	let isFocused = true;
    	b.listen("tauri://focus", () => $$invalidate(0, isFocused = true));
    	b.listen("tauri://blur", () => $$invalidate(0, isFocused = false));

    	/* Keep track of whether the window is maximized */
    	let isMaximized = false;

    	b.isMaximized().then(s => $$invalidate(1, isMaximized = s));
    	b.listen("tauri://resize", async () => $$invalidate(1, isMaximized = await b.isMaximized()));

    	/* Functions for the different menu buttons */
    	const minimize = () => b.minimize();

    	const maximize = () => b.toggleMaximize();
    	const close = () => b.close();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Titlebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		appWindow: b,
    		isFocused,
    		isMaximized,
    		minimize,
    		maximize,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ('isFocused' in $$props) $$invalidate(0, isFocused = $$props.isFocused);
    		if ('isMaximized' in $$props) $$invalidate(1, isMaximized = $$props.isMaximized);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isFocused, isMaximized, minimize, maximize, close];
    }

    class Titlebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Titlebar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.3 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let titlebar;
    	let t0;
    	let div1;
    	let div0;
    	let h1;
    	let t2;
    	let p;
    	let current;
    	titlebar = new Titlebar({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(titlebar.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "CodeX";
    			t2 = space();
    			p = element("p");
    			p.textContent = "To open a folder press Ctrl + O";
    			attr_dev(h1, "class", "svelte-gxviys");
    			add_location(h1, file, 14, 3, 364);
    			attr_dev(p, "class", "svelte-gxviys");
    			add_location(p, file, 15, 3, 382);
    			attr_dev(div0, "class", "card svelte-gxviys");
    			add_location(div0, file, 13, 2, 342);
    			attr_dev(div1, "class", "background svelte-gxviys");
    			add_location(div1, file, 12, 1, 315);
    			attr_dev(main, "focus", /*isFocused*/ ctx[0]);
    			attr_dev(main, "class", "svelte-gxviys");
    			add_location(main, file, 8, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(titlebar, main, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*isFocused*/ 1) {
    				attr_dev(main, "focus", /*isFocused*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(titlebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(titlebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(titlebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let isFocused = true;
    	b.listen("tauri://focus", () => $$invalidate(0, isFocused = true));
    	b.listen("tauri://blur", () => $$invalidate(0, isFocused = false));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Titlebar, appWindow: b, isFocused });

    	$$self.$inject_state = $$props => {
    		if ('isFocused' in $$props) $$invalidate(0, isFocused = $$props.isFocused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isFocused];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
