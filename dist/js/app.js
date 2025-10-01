(() => {
    "use strict";
    const modules_flsModules = {};
    function addLoadedClass() {
        if (!document.documentElement.classList.contains("loading")) window.addEventListener("load", function() {
            setTimeout(function() {
                document.documentElement.classList.add("loaded");
            }, 0);
        });
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        if (bodyLockStatus) {
            const lockPaddingElements = document.querySelectorAll("[data-lp]");
            setTimeout(() => {
                lockPaddingElements.forEach(lockPaddingElement => {
                    lockPaddingElement.style.paddingRight = "";
                });
                document.body.style.paddingRight = "";
                document.documentElement.classList.remove("lock");
            }, delay);
            bodyLockStatus = false;
            setTimeout(function() {
                bodyLockStatus = true;
            }, delay);
        }
    };
    let bodyLock = (delay = 500) => {
        if (bodyLockStatus) {
            const lockPaddingElements = document.querySelectorAll("[data-lp]");
            const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
            lockPaddingElements.forEach(lockPaddingElement => {
                lockPaddingElement.style.paddingRight = lockPaddingValue;
            });
            document.body.style.paddingRight = lockPaddingValue;
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout(function() {
                bodyLockStatus = true;
            }, delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".menu__icon")) document.addEventListener("click", function(e) {
            if (bodyLockStatus && e.target.closest(".menu__icon")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        });
    }
    function functions_FLS(message) {
        setTimeout(() => {
            if (window.FLS) console.log(message);
        }, 0);
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                fixElementSelector: "[data-lp]",
                youtubeAttribute: "data-popup-youtube",
                youtubePlaceAttribute: "data-popup-youtube-place",
                setAutoplayYoutube: true,
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: true,
                bodyLock: true,
                hashSettings: {
                    location: true,
                    goHash: true
                },
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.youTubeCode;
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.popupLogging(`Прокинувся`);
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if (this._dataValue !== "error") {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    } else this.popupLogging(`Йой, не заповнено атрибут у ${buttonOpen.classList}`);
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && e.which == 9 && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            if (this.options.hashSettings.goHash) {
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
                if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.youTubeCode) {
                        const codeVideo = this.youTubeCode;
                        const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
                        const iframe = document.createElement("iframe");
                        iframe.setAttribute("allowfullscreen", "");
                        const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
                        iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
                        iframe.setAttribute("src", urlVideo);
                        if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                            this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
                        }
                        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
                    }
                    if (this.options.hashSettings.location) {
                        this._getHash();
                        this._setHash();
                    }
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout(() => {
                        this._focusTrap();
                    }, 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.popupLogging(`Відкрив попап`);
                } else this.popupLogging(`Йой, такого попапу немає. Перевірте коректність введення. `);
            }
        }
        close(selectorValue) {
            if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            if (this.youTubeCode) if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout(() => {
                this._focusTrap();
            }, 50);
            this.popupLogging(`Закрив попап`);
        }
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            this.youTubeCode = buttons.getAttribute(this.options.youtubeAttribute) ? buttons.getAttribute(this.options.youtubeAttribute) : null;
            if (buttons && classInHash) this.open(classInHash);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && focusedIndex === 0) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
        popupLogging(message) {
            this.options.logging ? functions_FLS(`[Попапос]: ${message}`) : null;
        }
    }
    modules_flsModules.popup = new Popup({});
    function isObject(obj) {
        return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
    }
    function extend(target, src) {
        if (target === void 0) target = {};
        if (src === void 0) src = {};
        const noExtend = [ "__proto__", "constructor", "prototype" ];
        Object.keys(src).filter(key => noExtend.indexOf(key) < 0).forEach(key => {
            if (typeof target[key] === "undefined") target[key] = src[key]; else if (isObject(src[key]) && isObject(target[key]) && Object.keys(src[key]).length > 0) extend(target[key], src[key]);
        });
    }
    const ssrDocument = {
        body: {},
        addEventListener() {},
        removeEventListener() {},
        activeElement: {
            blur() {},
            nodeName: ""
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        getElementById() {
            return null;
        },
        createEvent() {
            return {
                initEvent() {}
            };
        },
        createElement() {
            return {
                children: [],
                childNodes: [],
                style: {},
                setAttribute() {},
                getElementsByTagName() {
                    return [];
                }
            };
        },
        createElementNS() {
            return {};
        },
        importNode() {
            return null;
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        }
    };
    function ssr_window_esm_getDocument() {
        const doc = typeof document !== "undefined" ? document : {};
        extend(doc, ssrDocument);
        return doc;
    }
    const ssrWindow = {
        document: ssrDocument,
        navigator: {
            userAgent: ""
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        },
        history: {
            replaceState() {},
            pushState() {},
            go() {},
            back() {}
        },
        CustomEvent: function CustomEvent() {
            return this;
        },
        addEventListener() {},
        removeEventListener() {},
        getComputedStyle() {
            return {
                getPropertyValue() {
                    return "";
                }
            };
        },
        Image() {},
        Date() {},
        screen: {},
        setTimeout() {},
        clearTimeout() {},
        matchMedia() {
            return {};
        },
        requestAnimationFrame(callback) {
            if (typeof setTimeout === "undefined") {
                callback();
                return null;
            }
            return setTimeout(callback, 0);
        },
        cancelAnimationFrame(id) {
            if (typeof setTimeout === "undefined") return;
            clearTimeout(id);
        }
    };
    function ssr_window_esm_getWindow() {
        const win = typeof window !== "undefined" ? window : {};
        extend(win, ssrWindow);
        return win;
    }
    function utils_classesToTokens(classes) {
        if (classes === void 0) classes = "";
        return classes.trim().split(" ").filter(c => !!c.trim());
    }
    function deleteProps(obj) {
        const object = obj;
        Object.keys(object).forEach(key => {
            try {
                object[key] = null;
            } catch (e) {}
            try {
                delete object[key];
            } catch (e) {}
        });
    }
    function utils_nextTick(callback, delay) {
        if (delay === void 0) delay = 0;
        return setTimeout(callback, delay);
    }
    function utils_now() {
        return Date.now();
    }
    function utils_getComputedStyle(el) {
        const window = ssr_window_esm_getWindow();
        let style;
        if (window.getComputedStyle) style = window.getComputedStyle(el, null);
        if (!style && el.currentStyle) style = el.currentStyle;
        if (!style) style = el.style;
        return style;
    }
    function utils_getTranslate(el, axis) {
        if (axis === void 0) axis = "x";
        const window = ssr_window_esm_getWindow();
        let matrix;
        let curTransform;
        let transformMatrix;
        const curStyle = utils_getComputedStyle(el);
        if (window.WebKitCSSMatrix) {
            curTransform = curStyle.transform || curStyle.webkitTransform;
            if (curTransform.split(",").length > 6) curTransform = curTransform.split(", ").map(a => a.replace(",", ".")).join(", ");
            transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
        } else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
            matrix = transformMatrix.toString().split(",");
        }
        if (axis === "x") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); else curTransform = parseFloat(matrix[4]);
        if (axis === "y") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); else curTransform = parseFloat(matrix[5]);
        return curTransform || 0;
    }
    function utils_isObject(o) {
        return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
    }
    function isNode(node) {
        if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") return node instanceof HTMLElement;
        return node && (node.nodeType === 1 || node.nodeType === 11);
    }
    function utils_extend() {
        const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
        const noExtend = [ "__proto__", "constructor", "prototype" ];
        for (let i = 1; i < arguments.length; i += 1) {
            const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
            if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
                const keysArray = Object.keys(Object(nextSource)).filter(key => noExtend.indexOf(key) < 0);
                for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
                    const nextKey = keysArray[nextIndex];
                    const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== void 0 && desc.enumerable) if (utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]); else if (!utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) {
                        to[nextKey] = {};
                        if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]);
                    } else to[nextKey] = nextSource[nextKey];
                }
            }
        }
        return to;
    }
    function utils_setCSSProperty(el, varName, varValue) {
        el.style.setProperty(varName, varValue);
    }
    function animateCSSModeScroll(_ref) {
        let {swiper, targetPosition, side} = _ref;
        const window = ssr_window_esm_getWindow();
        const startPosition = -swiper.translate;
        let startTime = null;
        let time;
        const duration = swiper.params.speed;
        swiper.wrapperEl.style.scrollSnapType = "none";
        window.cancelAnimationFrame(swiper.cssModeFrameID);
        const dir = targetPosition > startPosition ? "next" : "prev";
        const isOutOfBound = (current, target) => dir === "next" && current >= target || dir === "prev" && current <= target;
        const animate = () => {
            time = (new Date).getTime();
            if (startTime === null) startTime = time;
            const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
            const easeProgress = .5 - Math.cos(progress * Math.PI) / 2;
            let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
            if (isOutOfBound(currentPosition, targetPosition)) currentPosition = targetPosition;
            swiper.wrapperEl.scrollTo({
                [side]: currentPosition
            });
            if (isOutOfBound(currentPosition, targetPosition)) {
                swiper.wrapperEl.style.overflow = "hidden";
                swiper.wrapperEl.style.scrollSnapType = "";
                setTimeout(() => {
                    swiper.wrapperEl.style.overflow = "";
                    swiper.wrapperEl.scrollTo({
                        [side]: currentPosition
                    });
                });
                window.cancelAnimationFrame(swiper.cssModeFrameID);
                return;
            }
            swiper.cssModeFrameID = window.requestAnimationFrame(animate);
        };
        animate();
    }
    function utils_getSlideTransformEl(slideEl) {
        return slideEl.querySelector(".swiper-slide-transform") || slideEl.shadowRoot && slideEl.shadowRoot.querySelector(".swiper-slide-transform") || slideEl;
    }
    function utils_elementChildren(element, selector) {
        if (selector === void 0) selector = "";
        const window = ssr_window_esm_getWindow();
        const children = [ ...element.children ];
        if (window.HTMLSlotElement && element instanceof HTMLSlotElement) children.push(...element.assignedElements());
        if (!selector) return children;
        return children.filter(el => el.matches(selector));
    }
    function elementIsChildOfSlot(el, slot) {
        const elementsQueue = [ slot ];
        while (elementsQueue.length > 0) {
            const elementToCheck = elementsQueue.shift();
            if (el === elementToCheck) return true;
            elementsQueue.push(...elementToCheck.children, ...elementToCheck.shadowRoot ? elementToCheck.shadowRoot.children : [], ...elementToCheck.assignedElements ? elementToCheck.assignedElements() : []);
        }
    }
    function elementIsChildOf(el, parent) {
        const window = ssr_window_esm_getWindow();
        let isChild = parent.contains(el);
        if (!isChild && window.HTMLSlotElement && parent instanceof HTMLSlotElement) {
            const children = [ ...parent.assignedElements() ];
            isChild = children.includes(el);
            if (!isChild) isChild = elementIsChildOfSlot(el, parent);
        }
        return isChild;
    }
    function showWarning(text) {
        try {
            console.warn(text);
            return;
        } catch (err) {}
    }
    function utils_createElement(tag, classes) {
        if (classes === void 0) classes = [];
        const el = document.createElement(tag);
        el.classList.add(...Array.isArray(classes) ? classes : utils_classesToTokens(classes));
        return el;
    }
    function elementPrevAll(el, selector) {
        const prevEls = [];
        while (el.previousElementSibling) {
            const prev = el.previousElementSibling;
            if (selector) {
                if (prev.matches(selector)) prevEls.push(prev);
            } else prevEls.push(prev);
            el = prev;
        }
        return prevEls;
    }
    function elementNextAll(el, selector) {
        const nextEls = [];
        while (el.nextElementSibling) {
            const next = el.nextElementSibling;
            if (selector) {
                if (next.matches(selector)) nextEls.push(next);
            } else nextEls.push(next);
            el = next;
        }
        return nextEls;
    }
    function elementStyle(el, prop) {
        const window = ssr_window_esm_getWindow();
        return window.getComputedStyle(el, null).getPropertyValue(prop);
    }
    function utils_elementIndex(el) {
        let child = el;
        let i;
        if (child) {
            i = 0;
            while ((child = child.previousSibling) !== null) if (child.nodeType === 1) i += 1;
            return i;
        }
        return;
    }
    function utils_elementParents(el, selector) {
        const parents = [];
        let parent = el.parentElement;
        while (parent) {
            if (selector) {
                if (parent.matches(selector)) parents.push(parent);
            } else parents.push(parent);
            parent = parent.parentElement;
        }
        return parents;
    }
    function utils_elementTransitionEnd(el, callback) {
        function fireCallBack(e) {
            if (e.target !== el) return;
            callback.call(el, e);
            el.removeEventListener("transitionend", fireCallBack);
        }
        if (callback) el.addEventListener("transitionend", fireCallBack);
    }
    function elementOuterSize(el, size, includeMargins) {
        const window = ssr_window_esm_getWindow();
        if (includeMargins) return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
        return el.offsetWidth;
    }
    function utils_makeElementsArray(el) {
        return (Array.isArray(el) ? el : [ el ]).filter(e => !!e);
    }
    function utils_setInnerHTML(el, html) {
        if (html === void 0) html = "";
        if (typeof trustedTypes !== "undefined") el.innerHTML = trustedTypes.createPolicy("html", {
            createHTML: s => s
        }).createHTML(html); else el.innerHTML = html;
    }
    let support;
    function calcSupport() {
        const window = ssr_window_esm_getWindow();
        const document = ssr_window_esm_getDocument();
        return {
            smoothScroll: document.documentElement && document.documentElement.style && "scrollBehavior" in document.documentElement.style,
            touch: !!("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
    }
    function getSupport() {
        if (!support) support = calcSupport();
        return support;
    }
    let deviceCached;
    function calcDevice(_temp) {
        let {userAgent} = _temp === void 0 ? {} : _temp;
        const support = getSupport();
        const window = ssr_window_esm_getWindow();
        const platform = window.navigator.platform;
        const ua = userAgent || window.navigator.userAgent;
        const device = {
            ios: false,
            android: false
        };
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
        const windows = platform === "Win32";
        let macos = platform === "MacIntel";
        const iPadScreens = [ "1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810" ];
        if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
            ipad = ua.match(/(Version)\/([\d.]+)/);
            if (!ipad) ipad = [ 0, 1, "13_0_0" ];
            macos = false;
        }
        if (android && !windows) {
            device.os = "android";
            device.android = true;
        }
        if (ipad || iphone || ipod) {
            device.os = "ios";
            device.ios = true;
        }
        return device;
    }
    function getDevice(overrides) {
        if (overrides === void 0) overrides = {};
        if (!deviceCached) deviceCached = calcDevice(overrides);
        return deviceCached;
    }
    let browser;
    function calcBrowser() {
        const window = ssr_window_esm_getWindow();
        const device = getDevice();
        let needPerspectiveFix = false;
        function isSafari() {
            const ua = window.navigator.userAgent.toLowerCase();
            return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
        }
        if (isSafari()) {
            const ua = String(window.navigator.userAgent);
            if (ua.includes("Version/")) {
                const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map(num => Number(num));
                needPerspectiveFix = major < 16 || major === 16 && minor < 2;
            }
        }
        const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
        const isSafariBrowser = isSafari();
        const need3dFix = isSafariBrowser || isWebView && device.ios;
        return {
            isSafari: needPerspectiveFix || isSafariBrowser,
            needPerspectiveFix,
            need3dFix,
            isWebView
        };
    }
    function getBrowser() {
        if (!browser) browser = calcBrowser();
        return browser;
    }
    function Resize(_ref) {
        let {swiper, on, emit} = _ref;
        const window = ssr_window_esm_getWindow();
        let observer = null;
        let animationFrame = null;
        const resizeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("beforeResize");
            emit("resize");
        };
        const createObserver = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            observer = new ResizeObserver(entries => {
                animationFrame = window.requestAnimationFrame(() => {
                    const {width, height} = swiper;
                    let newWidth = width;
                    let newHeight = height;
                    entries.forEach(_ref2 => {
                        let {contentBoxSize, contentRect, target} = _ref2;
                        if (target && target !== swiper.el) return;
                        newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
                        newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
                    });
                    if (newWidth !== width || newHeight !== height) resizeHandler();
                });
            });
            observer.observe(swiper.el);
        };
        const removeObserver = () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            if (observer && observer.unobserve && swiper.el) {
                observer.unobserve(swiper.el);
                observer = null;
            }
        };
        const orientationChangeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("orientationchange");
        };
        on("init", () => {
            if (swiper.params.resizeObserver && typeof window.ResizeObserver !== "undefined") {
                createObserver();
                return;
            }
            window.addEventListener("resize", resizeHandler);
            window.addEventListener("orientationchange", orientationChangeHandler);
        });
        on("destroy", () => {
            removeObserver();
            window.removeEventListener("resize", resizeHandler);
            window.removeEventListener("orientationchange", orientationChangeHandler);
        });
    }
    function Observer(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const observers = [];
        const window = ssr_window_esm_getWindow();
        const attach = function(target, options) {
            if (options === void 0) options = {};
            const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            const observer = new ObserverFunc(mutations => {
                if (swiper.__preventObserver__) return;
                if (mutations.length === 1) {
                    emit("observerUpdate", mutations[0]);
                    return;
                }
                const observerUpdate = function observerUpdate() {
                    emit("observerUpdate", mutations[0]);
                };
                if (window.requestAnimationFrame) window.requestAnimationFrame(observerUpdate); else window.setTimeout(observerUpdate, 0);
            });
            observer.observe(target, {
                attributes: typeof options.attributes === "undefined" ? true : options.attributes,
                childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
                characterData: typeof options.characterData === "undefined" ? true : options.characterData
            });
            observers.push(observer);
        };
        const init = () => {
            if (!swiper.params.observer) return;
            if (swiper.params.observeParents) {
                const containerParents = utils_elementParents(swiper.hostEl);
                for (let i = 0; i < containerParents.length; i += 1) attach(containerParents[i]);
            }
            attach(swiper.hostEl, {
                childList: swiper.params.observeSlideChildren
            });
            attach(swiper.wrapperEl, {
                attributes: false
            });
        };
        const destroy = () => {
            observers.forEach(observer => {
                observer.disconnect();
            });
            observers.splice(0, observers.length);
        };
        extendParams({
            observer: false,
            observeParents: false,
            observeSlideChildren: false
        });
        on("init", init);
        on("destroy", destroy);
    }
    var eventsEmitter = {
        on(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            events.split(" ").forEach(event => {
                if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
                self.eventsListeners[event][method](handler);
            });
            return self;
        },
        once(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            function onceHandler() {
                self.off(events, onceHandler);
                if (onceHandler.__emitterProxy) delete onceHandler.__emitterProxy;
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                handler.apply(self, args);
            }
            onceHandler.__emitterProxy = handler;
            return self.on(events, onceHandler, priority);
        },
        onAny(handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            if (self.eventsAnyListeners.indexOf(handler) < 0) self.eventsAnyListeners[method](handler);
            return self;
        },
        offAny(handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsAnyListeners) return self;
            const index = self.eventsAnyListeners.indexOf(handler);
            if (index >= 0) self.eventsAnyListeners.splice(index, 1);
            return self;
        },
        off(events, handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            events.split(" ").forEach(event => {
                if (typeof handler === "undefined") self.eventsListeners[event] = []; else if (self.eventsListeners[event]) self.eventsListeners[event].forEach((eventHandler, index) => {
                    if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) self.eventsListeners[event].splice(index, 1);
                });
            });
            return self;
        },
        emit() {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            let events;
            let data;
            let context;
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
            if (typeof args[0] === "string" || Array.isArray(args[0])) {
                events = args[0];
                data = args.slice(1, args.length);
                context = self;
            } else {
                events = args[0].events;
                data = args[0].data;
                context = args[0].context || self;
            }
            data.unshift(context);
            const eventsArray = Array.isArray(events) ? events : events.split(" ");
            eventsArray.forEach(event => {
                if (self.eventsAnyListeners && self.eventsAnyListeners.length) self.eventsAnyListeners.forEach(eventHandler => {
                    eventHandler.apply(context, [ event, ...data ]);
                });
                if (self.eventsListeners && self.eventsListeners[event]) self.eventsListeners[event].forEach(eventHandler => {
                    eventHandler.apply(context, data);
                });
            });
            return self;
        }
    };
    function updateSize() {
        const swiper = this;
        let width;
        let height;
        const el = swiper.el;
        if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) width = swiper.params.width; else width = el.clientWidth;
        if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) height = swiper.params.height; else height = el.clientHeight;
        if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) return;
        width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
        height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
        if (Number.isNaN(width)) width = 0;
        if (Number.isNaN(height)) height = 0;
        Object.assign(swiper, {
            width,
            height,
            size: swiper.isHorizontal() ? width : height
        });
    }
    function updateSlides() {
        const swiper = this;
        function getDirectionPropertyValue(node, label) {
            return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
        }
        const params = swiper.params;
        const {wrapperEl, slidesEl, size: swiperSize, rtlTranslate: rtl, wrongRTL} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
        const slides = utils_elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
        const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
        let snapGrid = [];
        const slidesGrid = [];
        const slidesSizesGrid = [];
        let offsetBefore = params.slidesOffsetBefore;
        if (typeof offsetBefore === "function") offsetBefore = params.slidesOffsetBefore.call(swiper);
        let offsetAfter = params.slidesOffsetAfter;
        if (typeof offsetAfter === "function") offsetAfter = params.slidesOffsetAfter.call(swiper);
        const previousSnapGridLength = swiper.snapGrid.length;
        const previousSlidesGridLength = swiper.slidesGrid.length;
        let spaceBetween = params.spaceBetween;
        let slidePosition = -offsetBefore;
        let prevSlideSize = 0;
        let index = 0;
        if (typeof swiperSize === "undefined") return;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        swiper.virtualSize = -spaceBetween;
        slides.forEach(slideEl => {
            if (rtl) slideEl.style.marginLeft = ""; else slideEl.style.marginRight = "";
            slideEl.style.marginBottom = "";
            slideEl.style.marginTop = "";
        });
        if (params.centeredSlides && params.cssMode) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
        }
        const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
        if (gridEnabled) swiper.grid.initSlides(slides); else if (swiper.grid) swiper.grid.unsetSlides();
        let slideSize;
        const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter(key => typeof params.breakpoints[key].slidesPerView !== "undefined").length > 0;
        for (let i = 0; i < slidesLength; i += 1) {
            slideSize = 0;
            let slide;
            if (slides[i]) slide = slides[i];
            if (gridEnabled) swiper.grid.updateSlide(i, slide, slides);
            if (slides[i] && elementStyle(slide, "display") === "none") continue;
            if (params.slidesPerView === "auto") {
                if (shouldResetSlideSize) slides[i].style[swiper.getDirectionLabel("width")] = ``;
                const slideStyles = getComputedStyle(slide);
                const currentTransform = slide.style.transform;
                const currentWebKitTransform = slide.style.webkitTransform;
                if (currentTransform) slide.style.transform = "none";
                if (currentWebKitTransform) slide.style.webkitTransform = "none";
                if (params.roundLengths) slideSize = swiper.isHorizontal() ? elementOuterSize(slide, "width", true) : elementOuterSize(slide, "height", true); else {
                    const width = getDirectionPropertyValue(slideStyles, "width");
                    const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
                    const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
                    const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
                    const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
                    const boxSizing = slideStyles.getPropertyValue("box-sizing");
                    if (boxSizing && boxSizing === "border-box") slideSize = width + marginLeft + marginRight; else {
                        const {clientWidth, offsetWidth} = slide;
                        slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
                    }
                }
                if (currentTransform) slide.style.transform = currentTransform;
                if (currentWebKitTransform) slide.style.webkitTransform = currentWebKitTransform;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
            } else {
                slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
                if (slides[i]) slides[i].style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
            }
            if (slides[i]) slides[i].swiperSlideSize = slideSize;
            slidesSizesGrid.push(slideSize);
            if (params.centeredSlides) {
                slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
            } else {
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
                slidePosition = slidePosition + slideSize + spaceBetween;
            }
            swiper.virtualSize += slideSize + spaceBetween;
            prevSlideSize = slideSize;
            index += 1;
        }
        swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
        if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
        if (params.setWrapperSize) wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
        if (gridEnabled) swiper.grid.updateWrapperSize(slideSize, snapGrid);
        if (!params.centeredSlides) {
            const newSlidesGrid = [];
            for (let i = 0; i < snapGrid.length; i += 1) {
                let slidesGridItem = snapGrid[i];
                if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
                if (snapGrid[i] <= swiper.virtualSize - swiperSize) newSlidesGrid.push(slidesGridItem);
            }
            snapGrid = newSlidesGrid;
            if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) snapGrid.push(swiper.virtualSize - swiperSize);
        }
        if (isVirtual && params.loop) {
            const size = slidesSizesGrid[0] + spaceBetween;
            if (params.slidesPerGroup > 1) {
                const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
                const groupSize = size * params.slidesPerGroup;
                for (let i = 0; i < groups; i += 1) snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
            }
            for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
                if (params.slidesPerGroup === 1) snapGrid.push(snapGrid[snapGrid.length - 1] + size);
                slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
                swiper.virtualSize += size;
            }
        }
        if (snapGrid.length === 0) snapGrid = [ 0 ];
        if (spaceBetween !== 0) {
            const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
            slides.filter((_, slideIndex) => {
                if (!params.cssMode || params.loop) return true;
                if (slideIndex === slides.length - 1) return false;
                return true;
            }).forEach(slideEl => {
                slideEl.style[key] = `${spaceBetween}px`;
            });
        }
        if (params.centeredSlides && params.centeredSlidesBounds) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach(slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            });
            allSlidesSize -= spaceBetween;
            const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
            snapGrid = snapGrid.map(snap => {
                if (snap <= 0) return -offsetBefore;
                if (snap > maxSnap) return maxSnap + offsetAfter;
                return snap;
            });
        }
        if (params.centerInsufficientSlides) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach(slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            });
            allSlidesSize -= spaceBetween;
            const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
            if (allSlidesSize + offsetSize < swiperSize) {
                const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
                snapGrid.forEach((snap, snapIndex) => {
                    snapGrid[snapIndex] = snap - allSlidesOffset;
                });
                slidesGrid.forEach((snap, snapIndex) => {
                    slidesGrid[snapIndex] = snap + allSlidesOffset;
                });
            }
        }
        Object.assign(swiper, {
            slides,
            snapGrid,
            slidesGrid,
            slidesSizesGrid
        });
        if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
            const addToSnapGrid = -swiper.snapGrid[0];
            const addToSlidesGrid = -swiper.slidesGrid[0];
            swiper.snapGrid = swiper.snapGrid.map(v => v + addToSnapGrid);
            swiper.slidesGrid = swiper.slidesGrid.map(v => v + addToSlidesGrid);
        }
        if (slidesLength !== previousSlidesLength) swiper.emit("slidesLengthChange");
        if (snapGrid.length !== previousSnapGridLength) {
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            swiper.emit("snapGridLengthChange");
        }
        if (slidesGrid.length !== previousSlidesGridLength) swiper.emit("slidesGridLengthChange");
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        swiper.emit("slidesUpdated");
        if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
            const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
            const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
            if (slidesLength <= params.maxBackfaceHiddenSlides) {
                if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
            } else if (hasClassBackfaceClassAdded) swiper.el.classList.remove(backFaceHiddenClass);
        }
    }
    function updateAutoHeight(speed) {
        const swiper = this;
        const activeSlides = [];
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let newHeight = 0;
        let i;
        if (typeof speed === "number") swiper.setTransition(speed); else if (speed === true) swiper.setTransition(swiper.params.speed);
        const getSlideByIndex = index => {
            if (isVirtual) return swiper.slides[swiper.getSlideIndexByData(index)];
            return swiper.slides[index];
        };
        if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) if (swiper.params.centeredSlides) (swiper.visibleSlides || []).forEach(slide => {
            activeSlides.push(slide);
        }); else for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
        } else activeSlides.push(getSlideByIndex(swiper.activeIndex));
        for (i = 0; i < activeSlides.length; i += 1) if (typeof activeSlides[i] !== "undefined") {
            const height = activeSlides[i].offsetHeight;
            newHeight = height > newHeight ? height : newHeight;
        }
        if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
    }
    function updateSlidesOffset() {
        const swiper = this;
        const slides = swiper.slides;
        const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
        for (let i = 0; i < slides.length; i += 1) slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
    }
    const toggleSlideClasses$1 = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesProgress(translate) {
        if (translate === void 0) translate = this && this.translate || 0;
        const swiper = this;
        const params = swiper.params;
        const {slides, rtlTranslate: rtl, snapGrid} = swiper;
        if (slides.length === 0) return;
        if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
        let offsetCenter = -translate;
        if (rtl) offsetCenter = translate;
        swiper.visibleSlidesIndexes = [];
        swiper.visibleSlides = [];
        let spaceBetween = params.spaceBetween;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        for (let i = 0; i < slides.length; i += 1) {
            const slide = slides[i];
            let slideOffset = slide.swiperSlideOffset;
            if (params.cssMode && params.centeredSlides) slideOffset -= slides[0].swiperSlideOffset;
            const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const slideBefore = -(offsetCenter - slideOffset);
            const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
            const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
            const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
            if (isVisible) {
                swiper.visibleSlides.push(slide);
                swiper.visibleSlidesIndexes.push(i);
            }
            toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
            toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
            slide.progress = rtl ? -slideProgress : slideProgress;
            slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
        }
    }
    function updateProgress(translate) {
        const swiper = this;
        if (typeof translate === "undefined") {
            const multiplier = swiper.rtlTranslate ? -1 : 1;
            translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
        }
        const params = swiper.params;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        let {progress, isBeginning, isEnd, progressLoop} = swiper;
        const wasBeginning = isBeginning;
        const wasEnd = isEnd;
        if (translatesDiff === 0) {
            progress = 0;
            isBeginning = true;
            isEnd = true;
        } else {
            progress = (translate - swiper.minTranslate()) / translatesDiff;
            const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
            const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
            isBeginning = isBeginningRounded || progress <= 0;
            isEnd = isEndRounded || progress >= 1;
            if (isBeginningRounded) progress = 0;
            if (isEndRounded) progress = 1;
        }
        if (params.loop) {
            const firstSlideIndex = swiper.getSlideIndexByData(0);
            const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
            const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
            const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
            const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
            const translateAbs = Math.abs(translate);
            if (translateAbs >= firstSlideTranslate) progressLoop = (translateAbs - firstSlideTranslate) / translateMax; else progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
            if (progressLoop > 1) progressLoop -= 1;
        }
        Object.assign(swiper, {
            progress,
            progressLoop,
            isBeginning,
            isEnd
        });
        if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
        if (isBeginning && !wasBeginning) swiper.emit("reachBeginning toEdge");
        if (isEnd && !wasEnd) swiper.emit("reachEnd toEdge");
        if (wasBeginning && !isBeginning || wasEnd && !isEnd) swiper.emit("fromEdge");
        swiper.emit("progress", progress);
    }
    const toggleSlideClasses = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesClasses() {
        const swiper = this;
        const {slides, params, slidesEl, activeIndex} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const getFilteredSlide = selector => utils_elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
        let activeSlide;
        let prevSlide;
        let nextSlide;
        if (isVirtual) if (params.loop) {
            let slideIndex = activeIndex - swiper.virtual.slidesBefore;
            if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
            if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
            activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
        } else activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`); else if (gridEnabled) {
            activeSlide = slides.find(slideEl => slideEl.column === activeIndex);
            nextSlide = slides.find(slideEl => slideEl.column === activeIndex + 1);
            prevSlide = slides.find(slideEl => slideEl.column === activeIndex - 1);
        } else activeSlide = slides[activeIndex];
        if (activeSlide) if (!gridEnabled) {
            nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !nextSlide) nextSlide = slides[0];
            prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !prevSlide === 0) prevSlide = slides[slides.length - 1];
        }
        slides.forEach(slideEl => {
            toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
            toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
            toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
        });
        swiper.emitSlidesClasses();
    }
    const processLazyPreloader = (swiper, imageEl) => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
        const slideEl = imageEl.closest(slideSelector());
        if (slideEl) {
            let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (!lazyEl && swiper.isElement) if (slideEl.shadowRoot) lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`); else requestAnimationFrame(() => {
                if (slideEl.shadowRoot) {
                    lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                    if (lazyEl) lazyEl.remove();
                }
            });
            if (lazyEl) lazyEl.remove();
        }
    };
    const unlazy = (swiper, index) => {
        if (!swiper.slides[index]) return;
        const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
        if (imageEl) imageEl.removeAttribute("loading");
    };
    const preload = swiper => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        let amount = swiper.params.lazyPreloadPrevNext;
        const len = swiper.slides.length;
        if (!len || !amount || amount < 0) return;
        amount = Math.min(amount, len);
        const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
        const activeIndex = swiper.activeIndex;
        if (swiper.params.grid && swiper.params.grid.rows > 1) {
            const activeColumn = activeIndex;
            const preloadColumns = [ activeColumn - amount ];
            preloadColumns.push(...Array.from({
                length: amount
            }).map((_, i) => activeColumn + slidesPerView + i));
            swiper.slides.forEach((slideEl, i) => {
                if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
            });
            return;
        }
        const slideIndexLastInView = activeIndex + slidesPerView - 1;
        if (swiper.params.rewind || swiper.params.loop) for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
            const realIndex = (i % len + len) % len;
            if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
        } else for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) unlazy(swiper, i);
    };
    function getActiveIndexByTranslate(swiper) {
        const {slidesGrid, params} = swiper;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        let activeIndex;
        for (let i = 0; i < slidesGrid.length; i += 1) if (typeof slidesGrid[i + 1] !== "undefined") {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) activeIndex = i; else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) activeIndex = i + 1;
        } else if (translate >= slidesGrid[i]) activeIndex = i;
        if (params.normalizeSlideIndex) if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
        return activeIndex;
    }
    function updateActiveIndex(newActiveIndex) {
        const swiper = this;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        const {snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex} = swiper;
        let activeIndex = newActiveIndex;
        let snapIndex;
        const getVirtualRealIndex = aIndex => {
            let realIndex = aIndex - swiper.virtual.slidesBefore;
            if (realIndex < 0) realIndex = swiper.virtual.slides.length + realIndex;
            if (realIndex >= swiper.virtual.slides.length) realIndex -= swiper.virtual.slides.length;
            return realIndex;
        };
        if (typeof activeIndex === "undefined") activeIndex = getActiveIndexByTranslate(swiper);
        if (snapGrid.indexOf(translate) >= 0) snapIndex = snapGrid.indexOf(translate); else {
            const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
            snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
        }
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        if (activeIndex === previousIndex && !swiper.params.loop) {
            if (snapIndex !== previousSnapIndex) {
                swiper.snapIndex = snapIndex;
                swiper.emit("snapIndexChange");
            }
            return;
        }
        if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
            swiper.realIndex = getVirtualRealIndex(activeIndex);
            return;
        }
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        let realIndex;
        if (swiper.virtual && params.virtual.enabled && params.loop) realIndex = getVirtualRealIndex(activeIndex); else if (gridEnabled) {
            const firstSlideInColumn = swiper.slides.find(slideEl => slideEl.column === activeIndex);
            let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
            if (Number.isNaN(activeSlideIndex)) activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
            realIndex = Math.floor(activeSlideIndex / params.grid.rows);
        } else if (swiper.slides[activeIndex]) {
            const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
            if (slideIndex) realIndex = parseInt(slideIndex, 10); else realIndex = activeIndex;
        } else realIndex = activeIndex;
        Object.assign(swiper, {
            previousSnapIndex,
            snapIndex,
            previousRealIndex,
            realIndex,
            previousIndex,
            activeIndex
        });
        if (swiper.initialized) preload(swiper);
        swiper.emit("activeIndexChange");
        swiper.emit("snapIndexChange");
        if (swiper.initialized || swiper.params.runCallbacksOnInit) {
            if (previousRealIndex !== realIndex) swiper.emit("realIndexChange");
            swiper.emit("slideChange");
        }
    }
    function updateClickedSlide(el, path) {
        const swiper = this;
        const params = swiper.params;
        let slide = el.closest(`.${params.slideClass}, swiper-slide`);
        if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) [ ...path.slice(path.indexOf(el) + 1, path.length) ].forEach(pathEl => {
            if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) slide = pathEl;
        });
        let slideFound = false;
        let slideIndex;
        if (slide) for (let i = 0; i < swiper.slides.length; i += 1) if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
        }
        if (slide && slideFound) {
            swiper.clickedSlide = slide;
            if (swiper.virtual && swiper.params.virtual.enabled) swiper.clickedIndex = parseInt(slide.getAttribute("data-swiper-slide-index"), 10); else swiper.clickedIndex = slideIndex;
        } else {
            swiper.clickedSlide = void 0;
            swiper.clickedIndex = void 0;
            return;
        }
        if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) swiper.slideToClickedSlide();
    }
    var update = {
        updateSize,
        updateSlides,
        updateAutoHeight,
        updateSlidesOffset,
        updateSlidesProgress,
        updateProgress,
        updateSlidesClasses,
        updateActiveIndex,
        updateClickedSlide
    };
    function getSwiperTranslate(axis) {
        if (axis === void 0) axis = this.isHorizontal() ? "x" : "y";
        const swiper = this;
        const {params, rtlTranslate: rtl, translate, wrapperEl} = swiper;
        if (params.virtualTranslate) return rtl ? -translate : translate;
        if (params.cssMode) return translate;
        let currentTranslate = utils_getTranslate(wrapperEl, axis);
        currentTranslate += swiper.cssOverflowAdjustment();
        if (rtl) currentTranslate = -currentTranslate;
        return currentTranslate || 0;
    }
    function setTranslate(translate, byController) {
        const swiper = this;
        const {rtlTranslate: rtl, params, wrapperEl, progress} = swiper;
        let x = 0;
        let y = 0;
        const z = 0;
        if (swiper.isHorizontal()) x = rtl ? -translate : translate; else y = translate;
        if (params.roundLengths) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        swiper.previousTranslate = swiper.translate;
        swiper.translate = swiper.isHorizontal() ? x : y;
        if (params.cssMode) wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y; else if (!params.virtualTranslate) {
            if (swiper.isHorizontal()) x -= swiper.cssOverflowAdjustment(); else y -= swiper.cssOverflowAdjustment();
            wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        }
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== progress) swiper.updateProgress(translate);
        swiper.emit("setTranslate", swiper.translate, byController);
    }
    function minTranslate() {
        return -this.snapGrid[0];
    }
    function maxTranslate() {
        return -this.snapGrid[this.snapGrid.length - 1];
    }
    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
        if (translate === void 0) translate = 0;
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (translateBounds === void 0) translateBounds = true;
        const swiper = this;
        const {params, wrapperEl} = swiper;
        if (swiper.animating && params.preventInteractionOnTransition) return false;
        const minTranslate = swiper.minTranslate();
        const maxTranslate = swiper.maxTranslate();
        let newTranslate;
        if (translateBounds && translate > minTranslate) newTranslate = minTranslate; else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate; else newTranslate = translate;
        swiper.updateProgress(newTranslate);
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            if (speed === 0) wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate; else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: -newTranslate,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: -newTranslate,
                    behavior: "smooth"
                });
            }
            return true;
        }
        if (speed === 0) {
            swiper.setTransition(0);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionEnd");
            }
        } else {
            swiper.setTransition(speed);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionStart");
            }
            if (!swiper.animating) {
                swiper.animating = true;
                if (!swiper.onTranslateToWrapperTransitionEnd) swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
                    if (!swiper || swiper.destroyed) return;
                    if (e.target !== this) return;
                    swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
                    swiper.onTranslateToWrapperTransitionEnd = null;
                    delete swiper.onTranslateToWrapperTransitionEnd;
                    swiper.animating = false;
                    if (runCallbacks) swiper.emit("transitionEnd");
                };
                swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
            }
        }
        return true;
    }
    var translate = {
        getTranslate: getSwiperTranslate,
        setTranslate,
        minTranslate,
        maxTranslate,
        translateTo
    };
    function setTransition(duration, byController) {
        const swiper = this;
        if (!swiper.params.cssMode) {
            swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
            swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
        }
        swiper.emit("setTransition", duration, byController);
    }
    function transitionEmit(_ref) {
        let {swiper, runCallbacks, direction, step} = _ref;
        const {activeIndex, previousIndex} = swiper;
        let dir = direction;
        if (!dir) if (activeIndex > previousIndex) dir = "next"; else if (activeIndex < previousIndex) dir = "prev"; else dir = "reset";
        swiper.emit(`transition${step}`);
        if (runCallbacks && dir === "reset") swiper.emit(`slideResetTransition${step}`); else if (runCallbacks && activeIndex !== previousIndex) {
            swiper.emit(`slideChangeTransition${step}`);
            if (dir === "next") swiper.emit(`slideNextTransition${step}`); else swiper.emit(`slidePrevTransition${step}`);
        }
    }
    function transitionStart(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        if (params.cssMode) return;
        if (params.autoHeight) swiper.updateAutoHeight();
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "Start"
        });
    }
    function transitionEnd(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        swiper.animating = false;
        if (params.cssMode) return;
        swiper.setTransition(0);
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "End"
        });
    }
    var transition = {
        setTransition,
        transitionStart,
        transitionEnd
    };
    function slideTo(index, speed, runCallbacks, internal, initial) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") index = parseInt(index, 10);
        const swiper = this;
        let slideIndex = index;
        if (slideIndex < 0) slideIndex = 0;
        const {params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled} = swiper;
        if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) return false;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
        let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        const translate = -snapGrid[snapIndex];
        if (params.normalizeSlideIndex) for (let i = 0; i < slidesGrid.length; i += 1) {
            const normalizedTranslate = -Math.floor(translate * 100);
            const normalizedGrid = Math.floor(slidesGrid[i] * 100);
            const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
            if (typeof slidesGrid[i + 1] !== "undefined") {
                if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) slideIndex = i; else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) slideIndex = i + 1;
            } else if (normalizedTranslate >= normalizedGrid) slideIndex = i;
        }
        if (swiper.initialized && slideIndex !== activeIndex) {
            if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) return false;
            if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) if ((activeIndex || 0) !== slideIndex) return false;
        }
        if (slideIndex !== (previousIndex || 0) && runCallbacks) swiper.emit("beforeSlideChangeStart");
        swiper.updateProgress(translate);
        let direction;
        if (slideIndex > activeIndex) direction = "next"; else if (slideIndex < activeIndex) direction = "prev"; else direction = "reset";
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        const isInitialVirtual = isVirtual && initial;
        if (!isInitialVirtual && (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate)) {
            swiper.updateActiveIndex(slideIndex);
            if (params.autoHeight) swiper.updateAutoHeight();
            swiper.updateSlidesClasses();
            if (params.effect !== "slide") swiper.setTranslate(translate);
            if (direction !== "reset") {
                swiper.transitionStart(runCallbacks, direction);
                swiper.transitionEnd(runCallbacks, direction);
            }
            return false;
        }
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            const t = rtl ? translate : -translate;
            if (speed === 0) {
                if (isVirtual) {
                    swiper.wrapperEl.style.scrollSnapType = "none";
                    swiper._immediateVirtual = true;
                }
                if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
                    swiper._cssModeVirtualInitialSet = true;
                    requestAnimationFrame(() => {
                        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                    });
                } else wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                if (isVirtual) requestAnimationFrame(() => {
                    swiper.wrapperEl.style.scrollSnapType = "";
                    swiper._immediateVirtual = false;
                });
            } else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: t,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: t,
                    behavior: "smooth"
                });
            }
            return true;
        }
        const browser = getBrowser();
        const isSafari = browser.isSafari;
        if (isVirtual && !initial && isSafari && swiper.isElement) swiper.virtual.update(false, false, slideIndex);
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit("beforeTransitionStart", speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (speed === 0) swiper.transitionEnd(runCallbacks, direction); else if (!swiper.animating) {
            swiper.animating = true;
            if (!swiper.onSlideToWrapperTransitionEnd) swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
                if (!swiper || swiper.destroyed) return;
                if (e.target !== this) return;
                swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
                swiper.onSlideToWrapperTransitionEnd = null;
                delete swiper.onSlideToWrapperTransitionEnd;
                swiper.transitionEnd(runCallbacks, direction);
            };
            swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        }
        return true;
    }
    function slideToLoop(index, speed, runCallbacks, internal) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") {
            const indexAsNumber = parseInt(index, 10);
            index = indexAsNumber;
        }
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
        let newIndex = index;
        if (swiper.params.loop) if (swiper.virtual && swiper.params.virtual.enabled) newIndex += swiper.virtual.slidesBefore; else {
            let targetSlideIndex;
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                targetSlideIndex = swiper.slides.find(slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
            } else targetSlideIndex = swiper.getSlideIndexByData(newIndex);
            const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
            const {centeredSlides} = swiper.params;
            let slidesPerView = swiper.params.slidesPerView;
            if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
                slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
                if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
            }
            let needLoopFix = cols - targetSlideIndex < slidesPerView;
            if (centeredSlides) needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
            if (internal && centeredSlides && swiper.params.slidesPerView !== "auto" && !gridEnabled) needLoopFix = false;
            if (needLoopFix) {
                const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
                swiper.loopFix({
                    direction,
                    slideTo: true,
                    activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
                    slideRealIndex: direction === "next" ? swiper.realIndex : void 0
                });
            }
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                newIndex = swiper.slides.find(slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
            } else newIndex = swiper.getSlideIndexByData(newIndex);
        }
        requestAnimationFrame(() => {
            swiper.slideTo(newIndex, speed, runCallbacks, internal);
        });
        return swiper;
    }
    function slideNext(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {enabled, params, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let perGroup = params.slidesPerGroup;
        if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
        const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "next"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
            if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
                requestAnimationFrame(() => {
                    swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
                });
                return true;
            }
        }
        if (params.rewind && swiper.isEnd) return swiper.slideTo(0, speed, runCallbacks, internal);
        return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }
    function slidePrev(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params, snapGrid, slidesGrid, rtlTranslate, enabled, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "prev"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
        }
        const translate = rtlTranslate ? swiper.translate : -swiper.translate;
        function normalize(val) {
            if (val < 0) return -Math.floor(Math.abs(val));
            return Math.floor(val);
        }
        const normalizedTranslate = normalize(translate);
        const normalizedSnapGrid = snapGrid.map(val => normalize(val));
        const isFreeMode = params.freeMode && params.freeMode.enabled;
        let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
        if (typeof prevSnap === "undefined" && (params.cssMode || isFreeMode)) {
            let prevSnapIndex;
            snapGrid.forEach((snap, snapIndex) => {
                if (normalizedTranslate >= snap) prevSnapIndex = snapIndex;
            });
            if (typeof prevSnapIndex !== "undefined") prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
        let prevIndex = 0;
        if (typeof prevSnap !== "undefined") {
            prevIndex = slidesGrid.indexOf(prevSnap);
            if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
            if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
                prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
                prevIndex = Math.max(prevIndex, 0);
            }
        }
        if (params.rewind && swiper.isBeginning) {
            const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
            return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
        } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
            requestAnimationFrame(() => {
                swiper.slideTo(prevIndex, speed, runCallbacks, internal);
            });
            return true;
        }
        return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }
    function slideReset(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }
    function slideToClosest(speed, runCallbacks, internal, threshold) {
        if (runCallbacks === void 0) runCallbacks = true;
        if (threshold === void 0) threshold = .5;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let index = swiper.activeIndex;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
        const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        if (translate >= swiper.snapGrid[snapIndex]) {
            const currentSnap = swiper.snapGrid[snapIndex];
            const nextSnap = swiper.snapGrid[snapIndex + 1];
            if (translate - currentSnap > (nextSnap - currentSnap) * threshold) index += swiper.params.slidesPerGroup;
        } else {
            const prevSnap = swiper.snapGrid[snapIndex - 1];
            const currentSnap = swiper.snapGrid[snapIndex];
            if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) index -= swiper.params.slidesPerGroup;
        }
        index = Math.max(index, 0);
        index = Math.min(index, swiper.slidesGrid.length - 1);
        return swiper.slideTo(index, speed, runCallbacks, internal);
    }
    function slideToClickedSlide() {
        const swiper = this;
        if (swiper.destroyed) return;
        const {params, slidesEl} = swiper;
        const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
        let slideToIndex = swiper.getSlideIndexWhenGrid(swiper.clickedIndex);
        let realIndex;
        const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
        const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
        if (params.loop) {
            if (swiper.animating) return;
            realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
            if (params.centeredSlides) swiper.slideToLoop(realIndex); else if (slideToIndex > (isGrid ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1) : swiper.slides.length - slidesPerView)) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick(() => {
                    swiper.slideTo(slideToIndex);
                });
            } else swiper.slideTo(slideToIndex);
        } else swiper.slideTo(slideToIndex);
    }
    var slide = {
        slideTo,
        slideToLoop,
        slideNext,
        slidePrev,
        slideReset,
        slideToClosest,
        slideToClickedSlide
    };
    function loopCreate(slideRealIndex, initial) {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        const initSlides = () => {
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            slides.forEach((el, index) => {
                el.setAttribute("data-swiper-slide-index", index);
            });
        };
        const clearBlankSlides = () => {
            const slides = utils_elementChildren(slidesEl, `.${params.slideBlankClass}`);
            slides.forEach(el => {
                el.remove();
            });
            if (slides.length > 0) {
                swiper.recalcSlides();
                swiper.updateSlides();
            }
        };
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) clearBlankSlides();
        const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
        const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
        const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
        const addBlankSlides = amountOfSlides => {
            for (let i = 0; i < amountOfSlides; i += 1) {
                const slideEl = swiper.isElement ? utils_createElement("swiper-slide", [ params.slideBlankClass ]) : utils_createElement("div", [ params.slideClass, params.slideBlankClass ]);
                swiper.slidesEl.append(slideEl);
            }
        };
        if (shouldFillGroup) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else if (shouldFillGrid) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else initSlides();
        swiper.loopFix({
            slideRealIndex,
            direction: params.centeredSlides ? void 0 : "next",
            initial
        });
    }
    function loopFix(_temp) {
        let {slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex, initial, byController, byMousewheel} = _temp === void 0 ? {} : _temp;
        const swiper = this;
        if (!swiper.params.loop) return;
        swiper.emit("beforeLoopFix");
        const {slides, allowSlidePrev, allowSlideNext, slidesEl, params} = swiper;
        const {centeredSlides, initialSlide} = params;
        swiper.allowSlidePrev = true;
        swiper.allowSlideNext = true;
        if (swiper.virtual && params.virtual.enabled) {
            if (slideTo) if (!params.centeredSlides && swiper.snapIndex === 0) swiper.slideTo(swiper.virtual.slides.length, 0, false, true); else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true); else if (swiper.snapIndex === swiper.snapGrid.length - 1) swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
            swiper.allowSlidePrev = allowSlidePrev;
            swiper.allowSlideNext = allowSlideNext;
            swiper.emit("loopFix");
            return;
        }
        let slidesPerView = params.slidesPerView;
        if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
            slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
            if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
        }
        const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
        let loopedSlides = centeredSlides ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2)) : slidesPerGroup;
        if (loopedSlides % slidesPerGroup !== 0) loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
        loopedSlides += params.loopAdditionalSlides;
        swiper.loopedSlides = loopedSlides;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"); else if (gridEnabled && params.grid.fill === "row") showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
        const prependSlidesIndexes = [];
        const appendSlidesIndexes = [];
        const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
        const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !centeredSlides;
        let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
        if (typeof activeSlideIndex === "undefined") activeSlideIndex = swiper.getSlideIndex(slides.find(el => el.classList.contains(params.slideActiveClass))); else activeIndex = activeSlideIndex;
        const isNext = direction === "next" || !direction;
        const isPrev = direction === "prev" || !direction;
        let slidesPrepended = 0;
        let slidesAppended = 0;
        const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
        const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate === "undefined" ? -slidesPerView / 2 + .5 : 0);
        if (activeColIndexWithShift < loopedSlides) {
            slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
            for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) {
                    const colIndexToPrepend = cols - index - 1;
                    for (let i = slides.length - 1; i >= 0; i -= 1) if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
                } else prependSlidesIndexes.push(cols - index - 1);
            }
        } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
            slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
            if (isInitialOverflow) slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
            for (let i = 0; i < slidesAppended; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) slides.forEach((slide, slideIndex) => {
                    if (slide.column === index) appendSlidesIndexes.push(slideIndex);
                }); else appendSlidesIndexes.push(index);
            }
        }
        swiper.__preventObserver__ = true;
        requestAnimationFrame(() => {
            swiper.__preventObserver__ = false;
        });
        if (swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
            if (appendSlidesIndexes.includes(activeSlideIndex)) appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
            if (prependSlidesIndexes.includes(activeSlideIndex)) prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
        }
        if (isPrev) prependSlidesIndexes.forEach(index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.prepend(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        });
        if (isNext) appendSlidesIndexes.forEach(index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.append(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        });
        swiper.recalcSlides();
        if (params.slidesPerView === "auto") swiper.updateSlides(); else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) swiper.slides.forEach((slide, slideIndex) => {
            swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
        });
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        if (slideTo) if (prependSlidesIndexes.length > 0 && isPrev) {
            if (typeof slideRealIndex === "undefined") {
                const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
                const diff = newSlideTranslate - currentSlideTranslate;
                if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                    swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
                    if (setTranslate) {
                        swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                        swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                    }
                }
            } else if (setTranslate) {
                const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
                swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
                swiper.touchEventsData.currentTranslate = swiper.translate;
            }
        } else if (appendSlidesIndexes.length > 0 && isNext) if (typeof slideRealIndex === "undefined") {
            const currentSlideTranslate = swiper.slidesGrid[activeIndex];
            const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
            const diff = newSlideTranslate - currentSlideTranslate;
            if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
                if (setTranslate) {
                    swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                    swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                }
            }
        } else {
            const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
            swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.controller && swiper.controller.control && !byController) {
            const loopParams = {
                slideRealIndex,
                direction,
                setTranslate,
                activeSlideIndex,
                byController: true
            };
            if (Array.isArray(swiper.controller.control)) swiper.controller.control.forEach(c => {
                if (!c.destroyed && c.params.loop) c.loopFix({
                    ...loopParams,
                    slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
                });
            }); else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) swiper.controller.control.loopFix({
                ...loopParams,
                slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
            });
        }
        swiper.emit("loopFix");
    }
    function loopDestroy() {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || !slidesEl || swiper.virtual && swiper.params.virtual.enabled) return;
        swiper.recalcSlides();
        const newSlidesOrder = [];
        swiper.slides.forEach(slideEl => {
            const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
            newSlidesOrder[index] = slideEl;
        });
        swiper.slides.forEach(slideEl => {
            slideEl.removeAttribute("data-swiper-slide-index");
        });
        newSlidesOrder.forEach(slideEl => {
            slidesEl.append(slideEl);
        });
        swiper.recalcSlides();
        swiper.slideTo(swiper.realIndex, 0);
    }
    var loop = {
        loopCreate,
        loopFix,
        loopDestroy
    };
    function setGrabCursor(moving) {
        const swiper = this;
        if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        el.style.cursor = "move";
        el.style.cursor = moving ? "grabbing" : "grab";
        if (swiper.isElement) requestAnimationFrame(() => {
            swiper.__preventObserver__ = false;
        });
    }
    function unsetGrabCursor() {
        const swiper = this;
        if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
        if (swiper.isElement) requestAnimationFrame(() => {
            swiper.__preventObserver__ = false;
        });
    }
    var grabCursor = {
        setGrabCursor,
        unsetGrabCursor
    };
    function closestElement(selector, base) {
        if (base === void 0) base = this;
        function __closestFrom(el) {
            if (!el || el === ssr_window_esm_getDocument() || el === ssr_window_esm_getWindow()) return null;
            if (el.assignedSlot) el = el.assignedSlot;
            const found = el.closest(selector);
            if (!found && !el.getRootNode) return null;
            return found || __closestFrom(el.getRootNode().host);
        }
        return __closestFrom(base);
    }
    function preventEdgeSwipe(swiper, event, startX) {
        const window = ssr_window_esm_getWindow();
        const {params} = swiper;
        const edgeSwipeDetection = params.edgeSwipeDetection;
        const edgeSwipeThreshold = params.edgeSwipeThreshold;
        if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
            if (edgeSwipeDetection === "prevent") {
                event.preventDefault();
                return true;
            }
            return false;
        }
        return true;
    }
    function onTouchStart(event) {
        const swiper = this;
        const document = ssr_window_esm_getDocument();
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        const data = swiper.touchEventsData;
        if (e.type === "pointerdown") {
            if (data.pointerId !== null && data.pointerId !== e.pointerId) return;
            data.pointerId = e.pointerId;
        } else if (e.type === "touchstart" && e.targetTouches.length === 1) data.touchId = e.targetTouches[0].identifier;
        if (e.type === "touchstart") {
            preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
            return;
        }
        const {params, touches, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (swiper.animating && params.preventInteractionOnTransition) return;
        if (!swiper.animating && params.cssMode && params.loop) swiper.loopFix();
        let targetEl = e.target;
        if (params.touchEventsTarget === "wrapper") if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
        if ("which" in e && e.which === 3) return;
        if ("button" in e && e.button > 0) return;
        if (data.isTouched && data.isMoved) return;
        const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
        const eventPath = e.composedPath ? e.composedPath() : e.path;
        if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) targetEl = eventPath[0];
        const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
        const isTargetShadow = !!(e.target && e.target.shadowRoot);
        if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
            swiper.allowClick = true;
            return;
        }
        if (params.swipeHandler) if (!targetEl.closest(params.swipeHandler)) return;
        touches.currentX = e.pageX;
        touches.currentY = e.pageY;
        const startX = touches.currentX;
        const startY = touches.currentY;
        if (!preventEdgeSwipe(swiper, e, startX)) return;
        Object.assign(data, {
            isTouched: true,
            isMoved: false,
            allowTouchCallbacks: true,
            isScrolling: void 0,
            startMoving: void 0
        });
        touches.startX = startX;
        touches.startY = startY;
        data.touchStartTime = utils_now();
        swiper.allowClick = true;
        swiper.updateSize();
        swiper.swipeDirection = void 0;
        if (params.threshold > 0) data.allowThresholdMove = false;
        let preventDefault = true;
        if (targetEl.matches(data.focusableElements)) {
            preventDefault = false;
            if (targetEl.nodeName === "SELECT") data.isTouched = false;
        }
        if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl && (e.pointerType === "mouse" || e.pointerType !== "mouse" && !targetEl.matches(data.focusableElements))) document.activeElement.blur();
        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) e.preventDefault();
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) swiper.freeMode.onTouchStart();
        swiper.emit("touchStart", e);
    }
    function onTouchMove(event) {
        const document = ssr_window_esm_getDocument();
        const swiper = this;
        const data = swiper.touchEventsData;
        const {params, touches, rtlTranslate: rtl, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && event.pointerType === "mouse") return;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        if (e.type === "pointermove") {
            if (data.touchId !== null) return;
            const id = e.pointerId;
            if (id !== data.pointerId) return;
        }
        let targetTouch;
        if (e.type === "touchmove") {
            targetTouch = [ ...e.changedTouches ].find(t => t.identifier === data.touchId);
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        } else targetTouch = e;
        if (!data.isTouched) {
            if (data.startMoving && data.isScrolling) swiper.emit("touchMoveOpposite", e);
            return;
        }
        const pageX = targetTouch.pageX;
        const pageY = targetTouch.pageY;
        if (e.preventedByNestedSwiper) {
            touches.startX = pageX;
            touches.startY = pageY;
            return;
        }
        if (!swiper.allowTouchMove) {
            if (!e.target.matches(data.focusableElements)) swiper.allowClick = false;
            if (data.isTouched) {
                Object.assign(touches, {
                    startX: pageX,
                    startY: pageY,
                    currentX: pageX,
                    currentY: pageY
                });
                data.touchStartTime = utils_now();
            }
            return;
        }
        if (params.touchReleaseOnEdges && !params.loop) if (swiper.isVertical()) {
            if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
                data.isTouched = false;
                data.isMoved = false;
                return;
            }
        } else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) return; else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) return;
        if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== e.target && e.pointerType !== "mouse") document.activeElement.blur();
        if (document.activeElement) if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
            data.isMoved = true;
            swiper.allowClick = false;
            return;
        }
        if (data.allowTouchCallbacks) swiper.emit("touchMove", e);
        touches.previousX = touches.currentX;
        touches.previousY = touches.currentY;
        touches.currentX = pageX;
        touches.currentY = pageY;
        const diffX = touches.currentX - touches.startX;
        const diffY = touches.currentY - touches.startY;
        if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
        if (typeof data.isScrolling === "undefined") {
            let touchAngle;
            if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) data.isScrolling = false; else if (diffX * diffX + diffY * diffY >= 25) {
                touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
                data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
            }
        }
        if (data.isScrolling) swiper.emit("touchMoveOpposite", e);
        if (typeof data.startMoving === "undefined") if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) data.startMoving = true;
        if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
            data.isTouched = false;
            return;
        }
        if (!data.startMoving) return;
        swiper.allowClick = false;
        if (!params.cssMode && e.cancelable) e.preventDefault();
        if (params.touchMoveStopPropagation && !params.nested) e.stopPropagation();
        let diff = swiper.isHorizontal() ? diffX : diffY;
        let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
        if (params.oneWayMovement) {
            diff = Math.abs(diff) * (rtl ? 1 : -1);
            touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
        }
        touches.diff = diff;
        diff *= params.touchRatio;
        if (rtl) {
            diff = -diff;
            touchesDiff = -touchesDiff;
        }
        const prevTouchesDirection = swiper.touchesDirection;
        swiper.swipeDirection = diff > 0 ? "prev" : "next";
        swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
        const isLoop = swiper.params.loop && !params.cssMode;
        const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
        if (!data.isMoved) {
            if (isLoop && allowLoopFix) swiper.loopFix({
                direction: swiper.swipeDirection
            });
            data.startTranslate = swiper.getTranslate();
            swiper.setTransition(0);
            if (swiper.animating) {
                const evt = new window.CustomEvent("transitionend", {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        bySwiperTouchMove: true
                    }
                });
                swiper.wrapperEl.dispatchEvent(evt);
            }
            data.allowMomentumBounce = false;
            if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(true);
            swiper.emit("sliderFirstMove", e);
        }
        let loopFixed;
        (new Date).getTime();
        if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
            Object.assign(touches, {
                startX: pageX,
                startY: pageY,
                currentX: pageX,
                currentY: pageY,
                startTranslate: data.currentTranslate
            });
            data.loopSwapReset = true;
            data.startTranslate = data.currentTranslate;
            return;
        }
        swiper.emit("sliderMove", e);
        data.isMoved = true;
        data.currentTranslate = diff + data.startTranslate;
        let disableParentSwiper = true;
        let resistanceRatio = params.resistanceRatio;
        if (params.touchReleaseOnEdges) resistanceRatio = 0;
        if (diff > 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) swiper.loopFix({
                direction: "prev",
                setTranslate: true,
                activeSlideIndex: 0
            });
            if (data.currentTranslate > swiper.minTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
            }
        } else if (diff < 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) swiper.loopFix({
                direction: "next",
                setTranslate: true,
                activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
            });
            if (data.currentTranslate < swiper.maxTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
            }
        }
        if (disableParentSwiper) e.preventedByNestedSwiper = true;
        if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && !swiper.allowSlideNext) data.currentTranslate = data.startTranslate;
        if (params.threshold > 0) if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
            if (!data.allowThresholdMove) {
                data.allowThresholdMove = true;
                touches.startX = touches.currentX;
                touches.startY = touches.currentY;
                data.currentTranslate = data.startTranslate;
                touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
                return;
            }
        } else {
            data.currentTranslate = data.startTranslate;
            return;
        }
        if (!params.followFinger || params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode) swiper.freeMode.onTouchMove();
        swiper.updateProgress(data.currentTranslate);
        swiper.setTranslate(data.currentTranslate);
    }
    function onTouchEnd(event) {
        const swiper = this;
        const data = swiper.touchEventsData;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        let targetTouch;
        const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
        if (!isTouchEvent) {
            if (data.touchId !== null) return;
            if (e.pointerId !== data.pointerId) return;
            targetTouch = e;
        } else {
            targetTouch = [ ...e.changedTouches ].find(t => t.identifier === data.touchId);
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        }
        if ([ "pointercancel", "pointerout", "pointerleave", "contextmenu" ].includes(e.type)) {
            const proceed = [ "pointercancel", "contextmenu" ].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
            if (!proceed) return;
        }
        data.pointerId = null;
        data.touchId = null;
        const {params, touches, rtlTranslate: rtl, slidesGrid, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (data.allowTouchCallbacks) swiper.emit("touchEnd", e);
        data.allowTouchCallbacks = false;
        if (!data.isTouched) {
            if (data.isMoved && params.grabCursor) swiper.setGrabCursor(false);
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(false);
        const touchEndTime = utils_now();
        const timeDiff = touchEndTime - data.touchStartTime;
        if (swiper.allowClick) {
            const pathTree = e.path || e.composedPath && e.composedPath();
            swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
            swiper.emit("tap click", e);
            if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) swiper.emit("doubleTap doubleClick", e);
        }
        data.lastClickTime = utils_now();
        utils_nextTick(() => {
            if (!swiper.destroyed) swiper.allowClick = true;
        });
        if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
            data.isTouched = false;
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        let currentPos;
        if (params.followFinger) currentPos = rtl ? swiper.translate : -swiper.translate; else currentPos = -data.currentTranslate;
        if (params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled) {
            swiper.freeMode.onTouchEnd({
                currentPos
            });
            return;
        }
        const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
        let stopIndex = 0;
        let groupSize = swiper.slidesSizesGrid[0];
        for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
            const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
            if (typeof slidesGrid[i + increment] !== "undefined") {
                if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
                    stopIndex = i;
                    groupSize = slidesGrid[i + increment] - slidesGrid[i];
                }
            } else if (swipeToLast || currentPos >= slidesGrid[i]) {
                stopIndex = i;
                groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
            }
        }
        let rewindFirstIndex = null;
        let rewindLastIndex = null;
        if (params.rewind) if (swiper.isBeginning) rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1; else if (swiper.isEnd) rewindFirstIndex = 0;
        const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
        const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (timeDiff > params.longSwipesMs) {
            if (!params.longSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (swiper.swipeDirection === "next") if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment); else swiper.slideTo(stopIndex);
            if (swiper.swipeDirection === "prev") if (ratio > 1 - params.longSwipesRatio) swiper.slideTo(stopIndex + increment); else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) swiper.slideTo(rewindLastIndex); else swiper.slideTo(stopIndex);
        } else {
            if (!params.shortSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
            if (!isNavButtonTarget) {
                if (swiper.swipeDirection === "next") swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
                if (swiper.swipeDirection === "prev") swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
            } else if (e.target === swiper.navigation.nextEl) swiper.slideTo(stopIndex + increment); else swiper.slideTo(stopIndex);
        }
    }
    function onResize() {
        const swiper = this;
        const {params, el} = swiper;
        if (el && el.offsetWidth === 0) return;
        if (params.breakpoints) swiper.setBreakpoint();
        const {allowSlideNext, allowSlidePrev, snapGrid} = swiper;
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        swiper.allowSlideNext = true;
        swiper.allowSlidePrev = true;
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateSlidesClasses();
        const isVirtualLoop = isVirtual && params.loop;
        if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) swiper.slideTo(swiper.slides.length - 1, 0, false, true); else if (swiper.params.loop && !isVirtual) swiper.slideToLoop(swiper.realIndex, 0, false, true); else swiper.slideTo(swiper.activeIndex, 0, false, true);
        if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
            clearTimeout(swiper.autoplay.resizeTimeout);
            swiper.autoplay.resizeTimeout = setTimeout(() => {
                if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) swiper.autoplay.resume();
            }, 500);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
    }
    function onClick(e) {
        const swiper = this;
        if (!swiper.enabled) return;
        if (!swiper.allowClick) {
            if (swiper.params.preventClicks) e.preventDefault();
            if (swiper.params.preventClicksPropagation && swiper.animating) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    }
    function onScroll() {
        const swiper = this;
        const {wrapperEl, rtlTranslate, enabled} = swiper;
        if (!enabled) return;
        swiper.previousTranslate = swiper.translate;
        if (swiper.isHorizontal()) swiper.translate = -wrapperEl.scrollLeft; else swiper.translate = -wrapperEl.scrollTop;
        if (swiper.translate === 0) swiper.translate = 0;
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== swiper.progress) swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
        swiper.emit("setTranslate", swiper.translate, false);
    }
    function onLoad(e) {
        const swiper = this;
        processLazyPreloader(swiper, e.target);
        if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) return;
        swiper.update();
    }
    function onDocumentTouchStart() {
        const swiper = this;
        if (swiper.documentTouchHandlerProceeded) return;
        swiper.documentTouchHandlerProceeded = true;
        if (swiper.params.touchReleaseOnEdges) swiper.el.style.touchAction = "auto";
    }
    const events = (swiper, method) => {
        const document = ssr_window_esm_getDocument();
        const {params, el, wrapperEl, device} = swiper;
        const capture = !!params.nested;
        const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
        const swiperMethod = method;
        if (!el || typeof el === "string") return;
        document[domMethod]("touchstart", swiper.onDocumentTouchStart, {
            passive: false,
            capture
        });
        el[domMethod]("touchstart", swiper.onTouchStart, {
            passive: false
        });
        el[domMethod]("pointerdown", swiper.onTouchStart, {
            passive: false
        });
        document[domMethod]("touchmove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("pointermove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("touchend", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerup", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointercancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("touchcancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerout", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerleave", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("contextmenu", swiper.onTouchEnd, {
            passive: true
        });
        if (params.preventClicks || params.preventClicksPropagation) el[domMethod]("click", swiper.onClick, true);
        if (params.cssMode) wrapperEl[domMethod]("scroll", swiper.onScroll);
        if (params.updateOnWindowResize) swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true); else swiper[swiperMethod]("observerUpdate", onResize, true);
        el[domMethod]("load", swiper.onLoad, {
            capture: true
        });
    };
    function attachEvents() {
        const swiper = this;
        const {params} = swiper;
        swiper.onTouchStart = onTouchStart.bind(swiper);
        swiper.onTouchMove = onTouchMove.bind(swiper);
        swiper.onTouchEnd = onTouchEnd.bind(swiper);
        swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
        if (params.cssMode) swiper.onScroll = onScroll.bind(swiper);
        swiper.onClick = onClick.bind(swiper);
        swiper.onLoad = onLoad.bind(swiper);
        events(swiper, "on");
    }
    function detachEvents() {
        const swiper = this;
        events(swiper, "off");
    }
    var events$1 = {
        attachEvents,
        detachEvents
    };
    const isGridEnabled = (swiper, params) => swiper.grid && params.grid && params.grid.rows > 1;
    function setBreakpoint() {
        const swiper = this;
        const {realIndex, initialized, params, el} = swiper;
        const breakpoints = params.breakpoints;
        if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
        const document = ssr_window_esm_getDocument();
        const breakpointsBase = params.breakpointsBase === "window" || !params.breakpointsBase ? params.breakpointsBase : "container";
        const breakpointContainer = [ "window", "container" ].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document.querySelector(params.breakpointsBase);
        const breakpoint = swiper.getBreakpoint(breakpoints, breakpointsBase, breakpointContainer);
        if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
        const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : void 0;
        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const wasMultiRow = isGridEnabled(swiper, params);
        const isMultiRow = isGridEnabled(swiper, breakpointParams);
        const wasGrabCursor = swiper.params.grabCursor;
        const isGrabCursor = breakpointParams.grabCursor;
        const wasEnabled = params.enabled;
        if (wasMultiRow && !isMultiRow) {
            el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        } else if (!wasMultiRow && isMultiRow) {
            el.classList.add(`${params.containerModifierClass}grid`);
            if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") el.classList.add(`${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        }
        if (wasGrabCursor && !isGrabCursor) swiper.unsetGrabCursor(); else if (!wasGrabCursor && isGrabCursor) swiper.setGrabCursor();
        [ "navigation", "pagination", "scrollbar" ].forEach(prop => {
            if (typeof breakpointParams[prop] === "undefined") return;
            const wasModuleEnabled = params[prop] && params[prop].enabled;
            const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
            if (wasModuleEnabled && !isModuleEnabled) swiper[prop].disable();
            if (!wasModuleEnabled && isModuleEnabled) swiper[prop].enable();
        });
        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
        const wasLoop = params.loop;
        if (directionChanged && initialized) swiper.changeDirection();
        utils_extend(swiper.params, breakpointParams);
        const isEnabled = swiper.params.enabled;
        const hasLoop = swiper.params.loop;
        Object.assign(swiper, {
            allowTouchMove: swiper.params.allowTouchMove,
            allowSlideNext: swiper.params.allowSlideNext,
            allowSlidePrev: swiper.params.allowSlidePrev
        });
        if (wasEnabled && !isEnabled) swiper.disable(); else if (!wasEnabled && isEnabled) swiper.enable();
        swiper.currentBreakpoint = breakpoint;
        swiper.emit("_beforeBreakpoint", breakpointParams);
        if (initialized) if (needsReLoop) {
            swiper.loopDestroy();
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (!wasLoop && hasLoop) {
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (wasLoop && !hasLoop) swiper.loopDestroy();
        swiper.emit("breakpoint", breakpointParams);
    }
    function getBreakpoint(breakpoints, base, containerEl) {
        if (base === void 0) base = "window";
        if (!breakpoints || base === "container" && !containerEl) return;
        let breakpoint = false;
        const window = ssr_window_esm_getWindow();
        const currentHeight = base === "window" ? window.innerHeight : containerEl.clientHeight;
        const points = Object.keys(breakpoints).map(point => {
            if (typeof point === "string" && point.indexOf("@") === 0) {
                const minRatio = parseFloat(point.substr(1));
                const value = currentHeight * minRatio;
                return {
                    value,
                    point
                };
            }
            return {
                value: point,
                point
            };
        });
        points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
        for (let i = 0; i < points.length; i += 1) {
            const {point, value} = points[i];
            if (base === "window") {
                if (window.matchMedia(`(min-width: ${value}px)`).matches) breakpoint = point;
            } else if (value <= containerEl.clientWidth) breakpoint = point;
        }
        return breakpoint || "max";
    }
    var breakpoints = {
        setBreakpoint,
        getBreakpoint
    };
    function prepareClasses(entries, prefix) {
        const resultClasses = [];
        entries.forEach(item => {
            if (typeof item === "object") Object.keys(item).forEach(classNames => {
                if (item[classNames]) resultClasses.push(prefix + classNames);
            }); else if (typeof item === "string") resultClasses.push(prefix + item);
        });
        return resultClasses;
    }
    function addClasses() {
        const swiper = this;
        const {classNames, params, rtl, el, device} = swiper;
        const suffixes = prepareClasses([ "initialized", params.direction, {
            "free-mode": swiper.params.freeMode && params.freeMode.enabled
        }, {
            autoheight: params.autoHeight
        }, {
            rtl
        }, {
            grid: params.grid && params.grid.rows > 1
        }, {
            "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
        }, {
            android: device.android
        }, {
            ios: device.ios
        }, {
            "css-mode": params.cssMode
        }, {
            centered: params.cssMode && params.centeredSlides
        }, {
            "watch-progress": params.watchSlidesProgress
        } ], params.containerModifierClass);
        classNames.push(...suffixes);
        el.classList.add(...classNames);
        swiper.emitContainerClasses();
    }
    function swiper_core_removeClasses() {
        const swiper = this;
        const {el, classNames} = swiper;
        if (!el || typeof el === "string") return;
        el.classList.remove(...classNames);
        swiper.emitContainerClasses();
    }
    var classes = {
        addClasses,
        removeClasses: swiper_core_removeClasses
    };
    function checkOverflow() {
        const swiper = this;
        const {isLocked: wasLocked, params} = swiper;
        const {slidesOffsetBefore} = params;
        if (slidesOffsetBefore) {
            const lastSlideIndex = swiper.slides.length - 1;
            const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
            swiper.isLocked = swiper.size > lastSlideRightEdge;
        } else swiper.isLocked = swiper.snapGrid.length === 1;
        if (params.allowSlideNext === true) swiper.allowSlideNext = !swiper.isLocked;
        if (params.allowSlidePrev === true) swiper.allowSlidePrev = !swiper.isLocked;
        if (wasLocked && wasLocked !== swiper.isLocked) swiper.isEnd = false;
        if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? "lock" : "unlock");
    }
    var checkOverflow$1 = {
        checkOverflow
    };
    var defaults = {
        init: true,
        direction: "horizontal",
        oneWayMovement: false,
        swiperElementNodeName: "SWIPER-CONTAINER",
        touchEventsTarget: "wrapper",
        initialSlide: 0,
        speed: 300,
        cssMode: false,
        updateOnWindowResize: true,
        resizeObserver: true,
        nested: false,
        createElements: false,
        eventsPrefix: "swiper",
        enabled: true,
        focusableElements: "input, select, option, textarea, button, video, label",
        width: null,
        height: null,
        preventInteractionOnTransition: false,
        userAgent: null,
        url: null,
        edgeSwipeDetection: false,
        edgeSwipeThreshold: 20,
        autoHeight: false,
        setWrapperSize: false,
        virtualTranslate: false,
        effect: "slide",
        breakpoints: void 0,
        breakpointsBase: "window",
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: false,
        centeredSlides: false,
        centeredSlidesBounds: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: true,
        centerInsufficientSlides: false,
        watchOverflow: true,
        roundLengths: false,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: true,
        allowTouchMove: true,
        threshold: 5,
        touchMoveStopPropagation: false,
        touchStartPreventDefault: true,
        touchStartForcePreventDefault: false,
        touchReleaseOnEdges: false,
        uniqueNavElements: true,
        resistance: true,
        resistanceRatio: .85,
        watchSlidesProgress: false,
        grabCursor: false,
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        loop: false,
        loopAddBlankSlides: true,
        loopAdditionalSlides: 0,
        loopPreventsSliding: true,
        rewind: false,
        allowSlidePrev: true,
        allowSlideNext: true,
        swipeHandler: null,
        noSwiping: true,
        noSwipingClass: "swiper-no-swiping",
        noSwipingSelector: null,
        passiveListeners: true,
        maxBackfaceHiddenSlides: 10,
        containerModifierClass: "swiper-",
        slideClass: "swiper-slide",
        slideBlankClass: "swiper-slide-blank",
        slideActiveClass: "swiper-slide-active",
        slideVisibleClass: "swiper-slide-visible",
        slideFullyVisibleClass: "swiper-slide-fully-visible",
        slideNextClass: "swiper-slide-next",
        slidePrevClass: "swiper-slide-prev",
        wrapperClass: "swiper-wrapper",
        lazyPreloaderClass: "swiper-lazy-preloader",
        lazyPreloadPrevNext: 0,
        runCallbacksOnInit: true,
        _emitClasses: false
    };
    function moduleExtendParams(params, allModulesParams) {
        return function extendParams(obj) {
            if (obj === void 0) obj = {};
            const moduleParamName = Object.keys(obj)[0];
            const moduleParams = obj[moduleParamName];
            if (typeof moduleParams !== "object" || moduleParams === null) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (params[moduleParamName] === true) params[moduleParamName] = {
                enabled: true
            };
            if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) params[moduleParamName].auto = true;
            if ([ "pagination", "scrollbar" ].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) params[moduleParamName].auto = true;
            if (!(moduleParamName in params && "enabled" in moduleParams)) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) params[moduleParamName].enabled = true;
            if (!params[moduleParamName]) params[moduleParamName] = {
                enabled: false
            };
            utils_extend(allModulesParams, obj);
        };
    }
    const prototypes = {
        eventsEmitter,
        update,
        translate,
        transition,
        slide,
        loop,
        grabCursor,
        events: events$1,
        breakpoints,
        checkOverflow: checkOverflow$1,
        classes
    };
    const extendedDefaults = {};
    class swiper_core_Swiper {
        constructor() {
            let el;
            let params;
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") params = args[0]; else [el, params] = args;
            if (!params) params = {};
            params = utils_extend({}, params);
            if (el && !params.el) params.el = el;
            const document = ssr_window_esm_getDocument();
            if (params.el && typeof params.el === "string" && document.querySelectorAll(params.el).length > 1) {
                const swipers = [];
                document.querySelectorAll(params.el).forEach(containerEl => {
                    const newParams = utils_extend({}, params, {
                        el: containerEl
                    });
                    swipers.push(new swiper_core_Swiper(newParams));
                });
                return swipers;
            }
            const swiper = this;
            swiper.__swiper__ = true;
            swiper.support = getSupport();
            swiper.device = getDevice({
                userAgent: params.userAgent
            });
            swiper.browser = getBrowser();
            swiper.eventsListeners = {};
            swiper.eventsAnyListeners = [];
            swiper.modules = [ ...swiper.__modules__ ];
            if (params.modules && Array.isArray(params.modules)) swiper.modules.push(...params.modules);
            const allModulesParams = {};
            swiper.modules.forEach(mod => {
                mod({
                    params,
                    swiper,
                    extendParams: moduleExtendParams(params, allModulesParams),
                    on: swiper.on.bind(swiper),
                    once: swiper.once.bind(swiper),
                    off: swiper.off.bind(swiper),
                    emit: swiper.emit.bind(swiper)
                });
            });
            const swiperParams = utils_extend({}, defaults, allModulesParams);
            swiper.params = utils_extend({}, swiperParams, extendedDefaults, params);
            swiper.originalParams = utils_extend({}, swiper.params);
            swiper.passedParams = utils_extend({}, params);
            if (swiper.params && swiper.params.on) Object.keys(swiper.params.on).forEach(eventName => {
                swiper.on(eventName, swiper.params.on[eventName]);
            });
            if (swiper.params && swiper.params.onAny) swiper.onAny(swiper.params.onAny);
            Object.assign(swiper, {
                enabled: swiper.params.enabled,
                el,
                classNames: [],
                slides: [],
                slidesGrid: [],
                snapGrid: [],
                slidesSizesGrid: [],
                isHorizontal() {
                    return swiper.params.direction === "horizontal";
                },
                isVertical() {
                    return swiper.params.direction === "vertical";
                },
                activeIndex: 0,
                realIndex: 0,
                isBeginning: true,
                isEnd: false,
                translate: 0,
                previousTranslate: 0,
                progress: 0,
                velocity: 0,
                animating: false,
                cssOverflowAdjustment() {
                    return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
                },
                allowSlideNext: swiper.params.allowSlideNext,
                allowSlidePrev: swiper.params.allowSlidePrev,
                touchEventsData: {
                    isTouched: void 0,
                    isMoved: void 0,
                    allowTouchCallbacks: void 0,
                    touchStartTime: void 0,
                    isScrolling: void 0,
                    currentTranslate: void 0,
                    startTranslate: void 0,
                    allowThresholdMove: void 0,
                    focusableElements: swiper.params.focusableElements,
                    lastClickTime: 0,
                    clickTimeout: void 0,
                    velocities: [],
                    allowMomentumBounce: void 0,
                    startMoving: void 0,
                    pointerId: null,
                    touchId: null
                },
                allowClick: true,
                allowTouchMove: swiper.params.allowTouchMove,
                touches: {
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    diff: 0
                },
                imagesToLoad: [],
                imagesLoaded: 0
            });
            swiper.emit("_swiper");
            if (swiper.params.init) swiper.init();
            return swiper;
        }
        getDirectionLabel(property) {
            if (this.isHorizontal()) return property;
            return {
                width: "height",
                "margin-top": "margin-left",
                "margin-bottom ": "margin-right",
                "margin-left": "margin-top",
                "margin-right": "margin-bottom",
                "padding-left": "padding-top",
                "padding-right": "padding-bottom",
                marginRight: "marginBottom"
            }[property];
        }
        getSlideIndex(slideEl) {
            const {slidesEl, params} = this;
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            const firstSlideIndex = utils_elementIndex(slides[0]);
            return utils_elementIndex(slideEl) - firstSlideIndex;
        }
        getSlideIndexByData(index) {
            return this.getSlideIndex(this.slides.find(slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === index));
        }
        getSlideIndexWhenGrid(index) {
            if (this.grid && this.params.grid && this.params.grid.rows > 1) if (this.params.grid.fill === "column") index = Math.floor(index / this.params.grid.rows); else if (this.params.grid.fill === "row") index %= Math.ceil(this.slides.length / this.params.grid.rows);
            return index;
        }
        recalcSlides() {
            const swiper = this;
            const {slidesEl, params} = swiper;
            swiper.slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        }
        enable() {
            const swiper = this;
            if (swiper.enabled) return;
            swiper.enabled = true;
            if (swiper.params.grabCursor) swiper.setGrabCursor();
            swiper.emit("enable");
        }
        disable() {
            const swiper = this;
            if (!swiper.enabled) return;
            swiper.enabled = false;
            if (swiper.params.grabCursor) swiper.unsetGrabCursor();
            swiper.emit("disable");
        }
        setProgress(progress, speed) {
            const swiper = this;
            progress = Math.min(Math.max(progress, 0), 1);
            const min = swiper.minTranslate();
            const max = swiper.maxTranslate();
            const current = (max - min) * progress + min;
            swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        emitContainerClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const cls = swiper.el.className.split(" ").filter(className => className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0);
            swiper.emit("_containerClasses", cls.join(" "));
        }
        getSlideClasses(slideEl) {
            const swiper = this;
            if (swiper.destroyed) return "";
            return slideEl.className.split(" ").filter(className => className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0).join(" ");
        }
        emitSlidesClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const updates = [];
            swiper.slides.forEach(slideEl => {
                const classNames = swiper.getSlideClasses(slideEl);
                updates.push({
                    slideEl,
                    classNames
                });
                swiper.emit("_slideClass", slideEl, classNames);
            });
            swiper.emit("_slideClasses", updates);
        }
        slidesPerViewDynamic(view, exact) {
            if (view === void 0) view = "current";
            if (exact === void 0) exact = false;
            const swiper = this;
            const {params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex} = swiper;
            let spv = 1;
            if (typeof params.slidesPerView === "number") return params.slidesPerView;
            if (params.centeredSlides) {
                let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
                let breakLoop;
                for (let i = activeIndex + 1; i < slides.length; i += 1) if (slides[i] && !breakLoop) {
                    slideSize += Math.ceil(slides[i].swiperSlideSize);
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
                for (let i = activeIndex - 1; i >= 0; i -= 1) if (slides[i] && !breakLoop) {
                    slideSize += slides[i].swiperSlideSize;
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
            } else if (view === "current") for (let i = activeIndex + 1; i < slides.length; i += 1) {
                const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
                if (slideInView) spv += 1;
            } else for (let i = activeIndex - 1; i >= 0; i -= 1) {
                const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
                if (slideInView) spv += 1;
            }
            return spv;
        }
        update() {
            const swiper = this;
            if (!swiper || swiper.destroyed) return;
            const {snapGrid, params} = swiper;
            if (params.breakpoints) swiper.setBreakpoint();
            [ ...swiper.el.querySelectorAll('[loading="lazy"]') ].forEach(imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl);
            });
            swiper.updateSize();
            swiper.updateSlides();
            swiper.updateProgress();
            swiper.updateSlidesClasses();
            function setTranslate() {
                const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
                const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
                swiper.setTranslate(newTranslate);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
            let translated;
            if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
                setTranslate();
                if (params.autoHeight) swiper.updateAutoHeight();
            } else {
                if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
                    const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
                    translated = swiper.slideTo(slides.length - 1, 0, false, true);
                } else translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
                if (!translated) setTranslate();
            }
            if (params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
            swiper.emit("update");
        }
        changeDirection(newDirection, needUpdate) {
            if (needUpdate === void 0) needUpdate = true;
            const swiper = this;
            const currentDirection = swiper.params.direction;
            if (!newDirection) newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
            if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") return swiper;
            swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
            swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
            swiper.emitContainerClasses();
            swiper.params.direction = newDirection;
            swiper.slides.forEach(slideEl => {
                if (newDirection === "vertical") slideEl.style.width = ""; else slideEl.style.height = "";
            });
            swiper.emit("changeDirection");
            if (needUpdate) swiper.update();
            return swiper;
        }
        changeLanguageDirection(direction) {
            const swiper = this;
            if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
            swiper.rtl = direction === "rtl";
            swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
            if (swiper.rtl) {
                swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "rtl";
            } else {
                swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "ltr";
            }
            swiper.update();
        }
        mount(element) {
            const swiper = this;
            if (swiper.mounted) return true;
            let el = element || swiper.params.el;
            if (typeof el === "string") el = document.querySelector(el);
            if (!el) return false;
            el.swiper = swiper;
            if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) swiper.isElement = true;
            const getWrapperSelector = () => `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
            const getWrapper = () => {
                if (el && el.shadowRoot && el.shadowRoot.querySelector) {
                    const res = el.shadowRoot.querySelector(getWrapperSelector());
                    return res;
                }
                return utils_elementChildren(el, getWrapperSelector())[0];
            };
            let wrapperEl = getWrapper();
            if (!wrapperEl && swiper.params.createElements) {
                wrapperEl = utils_createElement("div", swiper.params.wrapperClass);
                el.append(wrapperEl);
                utils_elementChildren(el, `.${swiper.params.slideClass}`).forEach(slideEl => {
                    wrapperEl.append(slideEl);
                });
            }
            Object.assign(swiper, {
                el,
                wrapperEl,
                slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
                hostEl: swiper.isElement ? el.parentNode.host : el,
                mounted: true,
                rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
                rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
                wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
            });
            return true;
        }
        init(el) {
            const swiper = this;
            if (swiper.initialized) return swiper;
            const mounted = swiper.mount(el);
            if (mounted === false) return swiper;
            swiper.emit("beforeInit");
            if (swiper.params.breakpoints) swiper.setBreakpoint();
            swiper.addClasses();
            swiper.updateSize();
            swiper.updateSlides();
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            if (swiper.params.grabCursor && swiper.enabled) swiper.setGrabCursor();
            if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true); else swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
            if (swiper.params.loop) swiper.loopCreate(void 0, true);
            swiper.attachEvents();
            const lazyElements = [ ...swiper.el.querySelectorAll('[loading="lazy"]') ];
            if (swiper.isElement) lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
            lazyElements.forEach(imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl); else imageEl.addEventListener("load", e => {
                    processLazyPreloader(swiper, e.target);
                });
            });
            preload(swiper);
            swiper.initialized = true;
            preload(swiper);
            swiper.emit("init");
            swiper.emit("afterInit");
            return swiper;
        }
        destroy(deleteInstance, cleanStyles) {
            if (deleteInstance === void 0) deleteInstance = true;
            if (cleanStyles === void 0) cleanStyles = true;
            const swiper = this;
            const {params, el, wrapperEl, slides} = swiper;
            if (typeof swiper.params === "undefined" || swiper.destroyed) return null;
            swiper.emit("beforeDestroy");
            swiper.initialized = false;
            swiper.detachEvents();
            if (params.loop) swiper.loopDestroy();
            if (cleanStyles) {
                swiper.removeClasses();
                if (el && typeof el !== "string") el.removeAttribute("style");
                if (wrapperEl) wrapperEl.removeAttribute("style");
                if (slides && slides.length) slides.forEach(slideEl => {
                    slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
                    slideEl.removeAttribute("style");
                    slideEl.removeAttribute("data-swiper-slide-index");
                });
            }
            swiper.emit("destroy");
            Object.keys(swiper.eventsListeners).forEach(eventName => {
                swiper.off(eventName);
            });
            if (deleteInstance !== false) {
                if (swiper.el && typeof swiper.el !== "string") swiper.el.swiper = null;
                deleteProps(swiper);
            }
            swiper.destroyed = true;
            return null;
        }
        static extendDefaults(newDefaults) {
            utils_extend(extendedDefaults, newDefaults);
        }
        static get extendedDefaults() {
            return extendedDefaults;
        }
        static get defaults() {
            return defaults;
        }
        static installModule(mod) {
            if (!swiper_core_Swiper.prototype.__modules__) swiper_core_Swiper.prototype.__modules__ = [];
            const modules = swiper_core_Swiper.prototype.__modules__;
            if (typeof mod === "function" && modules.indexOf(mod) < 0) modules.push(mod);
        }
        static use(module) {
            if (Array.isArray(module)) {
                module.forEach(m => swiper_core_Swiper.installModule(m));
                return swiper_core_Swiper;
            }
            swiper_core_Swiper.installModule(module);
            return swiper_core_Swiper;
        }
    }
    Object.keys(prototypes).forEach(prototypeGroup => {
        Object.keys(prototypes[prototypeGroup]).forEach(protoMethod => {
            swiper_core_Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
        });
    });
    swiper_core_Swiper.use([ Resize, Observer ]);
    function create_element_if_not_defined_createElementIfNotDefined(swiper, originalParams, params, checkProps) {
        if (swiper.params.createElements) Object.keys(checkProps).forEach(key => {
            if (!params[key] && params.auto === true) {
                let element = utils_elementChildren(swiper.el, `.${checkProps[key]}`)[0];
                if (!element) {
                    element = utils_createElement("div", checkProps[key]);
                    element.className = checkProps[key];
                    swiper.el.append(element);
                }
                params[key] = element;
                originalParams[key] = element;
            }
        });
        return params;
    }
    function Navigation(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        extendParams({
            navigation: {
                nextEl: null,
                prevEl: null,
                hideOnClick: false,
                disabledClass: "swiper-button-disabled",
                hiddenClass: "swiper-button-hidden",
                lockClass: "swiper-button-lock",
                navigationDisabledClass: "swiper-navigation-disabled"
            }
        });
        swiper.navigation = {
            nextEl: null,
            prevEl: null
        };
        function getEl(el) {
            let res;
            if (el && typeof el === "string" && swiper.isElement) {
                res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
                if (res) return res;
            }
            if (el) {
                if (typeof el === "string") res = [ ...document.querySelectorAll(el) ];
                if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) res = swiper.el.querySelector(el); else if (res && res.length === 1) res = res[0];
            }
            if (el && !res) return el;
            return res;
        }
        function toggleEl(el, disabled) {
            const params = swiper.params.navigation;
            el = utils_makeElementsArray(el);
            el.forEach(subEl => {
                if (subEl) {
                    subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
                    if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
                    if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
                }
            });
        }
        function update() {
            const {nextEl, prevEl} = swiper.navigation;
            if (swiper.params.loop) {
                toggleEl(prevEl, false);
                toggleEl(nextEl, false);
                return;
            }
            toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
            toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
        }
        function onPrevClick(e) {
            e.preventDefault();
            if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slidePrev();
            emit("navigationPrev");
        }
        function onNextClick(e) {
            e.preventDefault();
            if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slideNext();
            emit("navigationNext");
        }
        function init() {
            const params = swiper.params.navigation;
            swiper.params.navigation = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
                nextEl: "swiper-button-next",
                prevEl: "swiper-button-prev"
            });
            if (!(params.nextEl || params.prevEl)) return;
            let nextEl = getEl(params.nextEl);
            let prevEl = getEl(params.prevEl);
            Object.assign(swiper.navigation, {
                nextEl,
                prevEl
            });
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const initButton = (el, dir) => {
                if (el) el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                if (!swiper.enabled && el) el.classList.add(...params.lockClass.split(" "));
            };
            nextEl.forEach(el => initButton(el, "next"));
            prevEl.forEach(el => initButton(el, "prev"));
        }
        function destroy() {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const destroyButton = (el, dir) => {
                el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
            };
            nextEl.forEach(el => destroyButton(el, "next"));
            prevEl.forEach(el => destroyButton(el, "prev"));
        }
        on("init", () => {
            if (swiper.params.navigation.enabled === false) disable(); else {
                init();
                update();
            }
        });
        on("toEdge fromEdge lock unlock", () => {
            update();
        });
        on("destroy", () => {
            destroy();
        });
        on("enable disable", () => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            if (swiper.enabled) {
                update();
                return;
            }
            [ ...nextEl, ...prevEl ].filter(el => !!el).forEach(el => el.classList.add(swiper.params.navigation.lockClass));
        });
        on("click", (_s, e) => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const targetEl = e.target;
            let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
            if (swiper.isElement && !targetIsButton) {
                const path = e.path || e.composedPath && e.composedPath();
                if (path) targetIsButton = path.find(pathEl => nextEl.includes(pathEl) || prevEl.includes(pathEl));
            }
            if (swiper.params.navigation.hideOnClick && !targetIsButton) {
                if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
                let isHidden;
                if (nextEl.length) isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass); else if (prevEl.length) isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
                if (isHidden === true) emit("navigationShow"); else emit("navigationHide");
                [ ...nextEl, ...prevEl ].filter(el => !!el).forEach(el => el.classList.toggle(swiper.params.navigation.hiddenClass));
            }
        });
        const enable = () => {
            swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
            init();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
            destroy();
        };
        Object.assign(swiper.navigation, {
            enable,
            disable,
            update,
            init,
            destroy
        });
    }
    function classes_to_selector_classesToSelector(classes) {
        if (classes === void 0) classes = "";
        return `.${classes.trim().replace(/([\.:!+\/()[\]])/g, "\\$1").replace(/ /g, ".")}`;
    }
    function Pagination(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const pfx = "swiper-pagination";
        extendParams({
            pagination: {
                el: null,
                bulletElement: "span",
                clickable: false,
                hideOnClick: false,
                renderBullet: null,
                renderProgressbar: null,
                renderFraction: null,
                renderCustom: null,
                progressbarOpposite: false,
                type: "bullets",
                dynamicBullets: false,
                dynamicMainBullets: 1,
                formatFractionCurrent: number => number,
                formatFractionTotal: number => number,
                bulletClass: `${pfx}-bullet`,
                bulletActiveClass: `${pfx}-bullet-active`,
                modifierClass: `${pfx}-`,
                currentClass: `${pfx}-current`,
                totalClass: `${pfx}-total`,
                hiddenClass: `${pfx}-hidden`,
                progressbarFillClass: `${pfx}-progressbar-fill`,
                progressbarOppositeClass: `${pfx}-progressbar-opposite`,
                clickableClass: `${pfx}-clickable`,
                lockClass: `${pfx}-lock`,
                horizontalClass: `${pfx}-horizontal`,
                verticalClass: `${pfx}-vertical`,
                paginationDisabledClass: `${pfx}-disabled`
            }
        });
        swiper.pagination = {
            el: null,
            bullets: []
        };
        let bulletSize;
        let dynamicBulletIndex = 0;
        function isPaginationDisabled() {
            return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
        }
        function setSideBullets(bulletEl, position) {
            const {bulletActiveClass} = swiper.params.pagination;
            if (!bulletEl) return;
            bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
            if (bulletEl) {
                bulletEl.classList.add(`${bulletActiveClass}-${position}`);
                bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
                if (bulletEl) bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
            }
        }
        function getMoveDirection(prevIndex, nextIndex, length) {
            prevIndex %= length;
            nextIndex %= length;
            if (nextIndex === prevIndex + 1) return "next"; else if (nextIndex === prevIndex - 1) return "previous";
            return;
        }
        function onBulletClick(e) {
            const bulletEl = e.target.closest(classes_to_selector_classesToSelector(swiper.params.pagination.bulletClass));
            if (!bulletEl) return;
            e.preventDefault();
            const index = utils_elementIndex(bulletEl) * swiper.params.slidesPerGroup;
            if (swiper.params.loop) {
                if (swiper.realIndex === index) return;
                const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
                if (moveDirection === "next") swiper.slideNext(); else if (moveDirection === "previous") swiper.slidePrev(); else swiper.slideToLoop(index);
            } else swiper.slideTo(index);
        }
        function update() {
            const rtl = swiper.rtl;
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            el = utils_makeElementsArray(el);
            let current;
            let previousIndex;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
            const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
            if (swiper.params.loop) {
                previousIndex = swiper.previousRealIndex || 0;
                current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
            } else if (typeof swiper.snapIndex !== "undefined") {
                current = swiper.snapIndex;
                previousIndex = swiper.previousSnapIndex;
            } else {
                previousIndex = swiper.previousIndex || 0;
                current = swiper.activeIndex || 0;
            }
            if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
                const bullets = swiper.pagination.bullets;
                let firstIndex;
                let lastIndex;
                let midIndex;
                if (params.dynamicBullets) {
                    bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height", true);
                    el.forEach(subEl => {
                        subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
                    });
                    if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
                        dynamicBulletIndex += current - (previousIndex || 0);
                        if (dynamicBulletIndex > params.dynamicMainBullets - 1) dynamicBulletIndex = params.dynamicMainBullets - 1; else if (dynamicBulletIndex < 0) dynamicBulletIndex = 0;
                    }
                    firstIndex = Math.max(current - dynamicBulletIndex, 0);
                    lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
                    midIndex = (lastIndex + firstIndex) / 2;
                }
                bullets.forEach(bulletEl => {
                    const classesToRemove = [ ...[ "", "-next", "-next-next", "-prev", "-prev-prev", "-main" ].map(suffix => `${params.bulletActiveClass}${suffix}`) ].map(s => typeof s === "string" && s.includes(" ") ? s.split(" ") : s).flat();
                    bulletEl.classList.remove(...classesToRemove);
                });
                if (el.length > 1) bullets.forEach(bullet => {
                    const bulletIndex = utils_elementIndex(bullet);
                    if (bulletIndex === current) bullet.classList.add(...params.bulletActiveClass.split(" ")); else if (swiper.isElement) bullet.setAttribute("part", "bullet");
                    if (params.dynamicBullets) {
                        if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        if (bulletIndex === firstIndex) setSideBullets(bullet, "prev");
                        if (bulletIndex === lastIndex) setSideBullets(bullet, "next");
                    }
                }); else {
                    const bullet = bullets[current];
                    if (bullet) bullet.classList.add(...params.bulletActiveClass.split(" "));
                    if (swiper.isElement) bullets.forEach((bulletEl, bulletIndex) => {
                        bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
                    });
                    if (params.dynamicBullets) {
                        const firstDisplayedBullet = bullets[firstIndex];
                        const lastDisplayedBullet = bullets[lastIndex];
                        for (let i = firstIndex; i <= lastIndex; i += 1) if (bullets[i]) bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        setSideBullets(firstDisplayedBullet, "prev");
                        setSideBullets(lastDisplayedBullet, "next");
                    }
                }
                if (params.dynamicBullets) {
                    const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
                    const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
                    const offsetProp = rtl ? "right" : "left";
                    bullets.forEach(bullet => {
                        bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
                    });
                }
            }
            el.forEach((subEl, subElIndex) => {
                if (params.type === "fraction") {
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.currentClass)).forEach(fractionEl => {
                        fractionEl.textContent = params.formatFractionCurrent(current + 1);
                    });
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.totalClass)).forEach(totalEl => {
                        totalEl.textContent = params.formatFractionTotal(total);
                    });
                }
                if (params.type === "progressbar") {
                    let progressbarDirection;
                    if (params.progressbarOpposite) progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal"; else progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
                    const scale = (current + 1) / total;
                    let scaleX = 1;
                    let scaleY = 1;
                    if (progressbarDirection === "horizontal") scaleX = scale; else scaleY = scale;
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.progressbarFillClass)).forEach(progressEl => {
                        progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
                        progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
                    });
                }
                if (params.type === "custom" && params.renderCustom) {
                    utils_setInnerHTML(subEl, params.renderCustom(swiper, current + 1, total));
                    if (subElIndex === 0) emit("paginationRender", subEl);
                } else {
                    if (subElIndex === 0) emit("paginationRender", subEl);
                    emit("paginationUpdate", subEl);
                }
                if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
            });
        }
        function render() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
            let el = swiper.pagination.el;
            el = utils_makeElementsArray(el);
            let paginationHTML = "";
            if (params.type === "bullets") {
                let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
                if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) numberOfBullets = slidesLength;
                for (let i = 0; i < numberOfBullets; i += 1) if (params.renderBullet) paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass); else paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
            if (params.type === "fraction") if (params.renderFraction) paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass); else paginationHTML = `<span class="${params.currentClass}"></span>` + " / " + `<span class="${params.totalClass}"></span>`;
            if (params.type === "progressbar") if (params.renderProgressbar) paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass); else paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
            swiper.pagination.bullets = [];
            el.forEach(subEl => {
                if (params.type !== "custom") utils_setInnerHTML(subEl, paginationHTML || "");
                if (params.type === "bullets") swiper.pagination.bullets.push(...subEl.querySelectorAll(classes_to_selector_classesToSelector(params.bulletClass)));
            });
            if (params.type !== "custom") emit("paginationRender", el[0]);
        }
        function init() {
            swiper.params.pagination = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
                el: "swiper-pagination"
            });
            const params = swiper.params.pagination;
            if (!params.el) return;
            let el;
            if (typeof params.el === "string" && swiper.isElement) el = swiper.el.querySelector(params.el);
            if (!el && typeof params.el === "string") el = [ ...document.querySelectorAll(params.el) ];
            if (!el) el = params.el;
            if (!el || el.length === 0) return;
            if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
                el = [ ...swiper.el.querySelectorAll(params.el) ];
                if (el.length > 1) el = el.find(subEl => {
                    if (utils_elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
                    return true;
                });
            }
            if (Array.isArray(el) && el.length === 1) el = el[0];
            Object.assign(swiper.pagination, {
                el
            });
            el = utils_makeElementsArray(el);
            el.forEach(subEl => {
                if (params.type === "bullets" && params.clickable) subEl.classList.add(...(params.clickableClass || "").split(" "));
                subEl.classList.add(params.modifierClass + params.type);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                if (params.type === "bullets" && params.dynamicBullets) {
                    subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
                    dynamicBulletIndex = 0;
                    if (params.dynamicMainBullets < 1) params.dynamicMainBullets = 1;
                }
                if (params.type === "progressbar" && params.progressbarOpposite) subEl.classList.add(params.progressbarOppositeClass);
                if (params.clickable) subEl.addEventListener("click", onBulletClick);
                if (!swiper.enabled) subEl.classList.add(params.lockClass);
            });
        }
        function destroy() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach(subEl => {
                    subEl.classList.remove(params.hiddenClass);
                    subEl.classList.remove(params.modifierClass + params.type);
                    subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                    if (params.clickable) {
                        subEl.classList.remove(...(params.clickableClass || "").split(" "));
                        subEl.removeEventListener("click", onBulletClick);
                    }
                });
            }
            if (swiper.pagination.bullets) swiper.pagination.bullets.forEach(subEl => subEl.classList.remove(...params.bulletActiveClass.split(" ")));
        }
        on("changeDirection", () => {
            if (!swiper.pagination || !swiper.pagination.el) return;
            const params = swiper.params.pagination;
            let {el} = swiper.pagination;
            el = utils_makeElementsArray(el);
            el.forEach(subEl => {
                subEl.classList.remove(params.horizontalClass, params.verticalClass);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            });
        });
        on("init", () => {
            if (swiper.params.pagination.enabled === false) disable(); else {
                init();
                render();
                update();
            }
        });
        on("activeIndexChange", () => {
            if (typeof swiper.snapIndex === "undefined") update();
        });
        on("snapIndexChange", () => {
            update();
        });
        on("snapGridLengthChange", () => {
            render();
            update();
        });
        on("destroy", () => {
            destroy();
        });
        on("enable disable", () => {
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach(subEl => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass));
            }
        });
        on("lock unlock", () => {
            update();
        });
        on("click", (_s, e) => {
            const targetEl = e.target;
            const el = utils_makeElementsArray(swiper.pagination.el);
            if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
                if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
                const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
                if (isHidden === true) emit("paginationShow"); else emit("paginationHide");
                el.forEach(subEl => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
            }
        });
        const enable = () => {
            swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach(subEl => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
            }
            init();
            render();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach(subEl => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
            }
            destroy();
        };
        Object.assign(swiper.pagination, {
            enable,
            disable,
            render,
            update,
            init,
            destroy
        });
    }
    function Thumb(_ref) {
        let {swiper, extendParams, on} = _ref;
        extendParams({
            thumbs: {
                swiper: null,
                multipleActiveThumbs: true,
                autoScrollOffset: 0,
                slideThumbActiveClass: "swiper-slide-thumb-active",
                thumbsContainerClass: "swiper-thumbs"
            }
        });
        let initialized = false;
        let swiperCreated = false;
        swiper.thumbs = {
            swiper: null
        };
        function onThumbClick() {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed) return;
            const clickedIndex = thumbsSwiper.clickedIndex;
            const clickedSlide = thumbsSwiper.clickedSlide;
            if (clickedSlide && clickedSlide.classList.contains(swiper.params.thumbs.slideThumbActiveClass)) return;
            if (typeof clickedIndex === "undefined" || clickedIndex === null) return;
            let slideToIndex;
            if (thumbsSwiper.params.loop) slideToIndex = parseInt(thumbsSwiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10); else slideToIndex = clickedIndex;
            if (swiper.params.loop) swiper.slideToLoop(slideToIndex); else swiper.slideTo(slideToIndex);
        }
        function init() {
            const {thumbs: thumbsParams} = swiper.params;
            if (initialized) return false;
            initialized = true;
            const SwiperClass = swiper.constructor;
            if (thumbsParams.swiper instanceof SwiperClass) {
                if (thumbsParams.swiper.destroyed) {
                    initialized = false;
                    return false;
                }
                swiper.thumbs.swiper = thumbsParams.swiper;
                Object.assign(swiper.thumbs.swiper.originalParams, {
                    watchSlidesProgress: true,
                    slideToClickedSlide: false
                });
                Object.assign(swiper.thumbs.swiper.params, {
                    watchSlidesProgress: true,
                    slideToClickedSlide: false
                });
                swiper.thumbs.swiper.update();
            } else if (utils_isObject(thumbsParams.swiper)) {
                const thumbsSwiperParams = Object.assign({}, thumbsParams.swiper);
                Object.assign(thumbsSwiperParams, {
                    watchSlidesProgress: true,
                    slideToClickedSlide: false
                });
                swiper.thumbs.swiper = new SwiperClass(thumbsSwiperParams);
                swiperCreated = true;
            }
            swiper.thumbs.swiper.el.classList.add(swiper.params.thumbs.thumbsContainerClass);
            swiper.thumbs.swiper.on("tap", onThumbClick);
            return true;
        }
        function update(initial) {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed) return;
            const slidesPerView = thumbsSwiper.params.slidesPerView === "auto" ? thumbsSwiper.slidesPerViewDynamic() : thumbsSwiper.params.slidesPerView;
            let thumbsToActivate = 1;
            const thumbActiveClass = swiper.params.thumbs.slideThumbActiveClass;
            if (swiper.params.slidesPerView > 1 && !swiper.params.centeredSlides) thumbsToActivate = swiper.params.slidesPerView;
            if (!swiper.params.thumbs.multipleActiveThumbs) thumbsToActivate = 1;
            thumbsToActivate = Math.floor(thumbsToActivate);
            thumbsSwiper.slides.forEach(slideEl => slideEl.classList.remove(thumbActiveClass));
            if (thumbsSwiper.params.loop || thumbsSwiper.params.virtual && thumbsSwiper.params.virtual.enabled) for (let i = 0; i < thumbsToActivate; i += 1) utils_elementChildren(thumbsSwiper.slidesEl, `[data-swiper-slide-index="${swiper.realIndex + i}"]`).forEach(slideEl => {
                slideEl.classList.add(thumbActiveClass);
            }); else for (let i = 0; i < thumbsToActivate; i += 1) if (thumbsSwiper.slides[swiper.realIndex + i]) thumbsSwiper.slides[swiper.realIndex + i].classList.add(thumbActiveClass);
            const autoScrollOffset = swiper.params.thumbs.autoScrollOffset;
            const useOffset = autoScrollOffset && !thumbsSwiper.params.loop;
            if (swiper.realIndex !== thumbsSwiper.realIndex || useOffset) {
                const currentThumbsIndex = thumbsSwiper.activeIndex;
                let newThumbsIndex;
                let direction;
                if (thumbsSwiper.params.loop) {
                    const newThumbsSlide = thumbsSwiper.slides.find(slideEl => slideEl.getAttribute("data-swiper-slide-index") === `${swiper.realIndex}`);
                    newThumbsIndex = thumbsSwiper.slides.indexOf(newThumbsSlide);
                    direction = swiper.activeIndex > swiper.previousIndex ? "next" : "prev";
                } else {
                    newThumbsIndex = swiper.realIndex;
                    direction = newThumbsIndex > swiper.previousIndex ? "next" : "prev";
                }
                if (useOffset) newThumbsIndex += direction === "next" ? autoScrollOffset : -1 * autoScrollOffset;
                if (thumbsSwiper.visibleSlidesIndexes && thumbsSwiper.visibleSlidesIndexes.indexOf(newThumbsIndex) < 0) {
                    if (thumbsSwiper.params.centeredSlides) if (newThumbsIndex > currentThumbsIndex) newThumbsIndex = newThumbsIndex - Math.floor(slidesPerView / 2) + 1; else newThumbsIndex = newThumbsIndex + Math.floor(slidesPerView / 2) - 1; else if (newThumbsIndex > currentThumbsIndex && thumbsSwiper.params.slidesPerGroup === 1) ;
                    thumbsSwiper.slideTo(newThumbsIndex, initial ? 0 : void 0);
                }
            }
        }
        on("beforeInit", () => {
            const {thumbs} = swiper.params;
            if (!thumbs || !thumbs.swiper) return;
            if (typeof thumbs.swiper === "string" || thumbs.swiper instanceof HTMLElement) {
                const document = ssr_window_esm_getDocument();
                const getThumbsElementAndInit = () => {
                    const thumbsElement = typeof thumbs.swiper === "string" ? document.querySelector(thumbs.swiper) : thumbs.swiper;
                    if (thumbsElement && thumbsElement.swiper) {
                        thumbs.swiper = thumbsElement.swiper;
                        init();
                        update(true);
                    } else if (thumbsElement) {
                        const eventName = `${swiper.params.eventsPrefix}init`;
                        const onThumbsSwiper = e => {
                            thumbs.swiper = e.detail[0];
                            thumbsElement.removeEventListener(eventName, onThumbsSwiper);
                            init();
                            update(true);
                            thumbs.swiper.update();
                            swiper.update();
                        };
                        thumbsElement.addEventListener(eventName, onThumbsSwiper);
                    }
                    return thumbsElement;
                };
                const watchForThumbsToAppear = () => {
                    if (swiper.destroyed) return;
                    const thumbsElement = getThumbsElementAndInit();
                    if (!thumbsElement) requestAnimationFrame(watchForThumbsToAppear);
                };
                requestAnimationFrame(watchForThumbsToAppear);
            } else {
                init();
                update(true);
            }
        });
        on("slideChange update resize observerUpdate", () => {
            update();
        });
        on("setTransition", (_s, duration) => {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed) return;
            thumbsSwiper.setTransition(duration);
        });
        on("beforeDestroy", () => {
            const thumbsSwiper = swiper.thumbs.swiper;
            if (!thumbsSwiper || thumbsSwiper.destroyed) return;
            if (swiperCreated) thumbsSwiper.destroy();
        });
        Object.assign(swiper.thumbs, {
            init,
            update
        });
    }
    function effect_init_effectInit(params) {
        const {effect, swiper, on, setTranslate, setTransition, overwriteParams, perspective, recreateShadows, getEffectParams} = params;
        on("beforeInit", () => {
            if (swiper.params.effect !== effect) return;
            swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
            if (perspective && perspective()) swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
            const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
            Object.assign(swiper.params, overwriteParamsResult);
            Object.assign(swiper.originalParams, overwriteParamsResult);
        });
        on("setTranslate _virtualUpdated", () => {
            if (swiper.params.effect !== effect) return;
            setTranslate();
        });
        on("setTransition", (_s, duration) => {
            if (swiper.params.effect !== effect) return;
            setTransition(duration);
        });
        on("transitionEnd", () => {
            if (swiper.params.effect !== effect) return;
            if (recreateShadows) {
                if (!getEffectParams || !getEffectParams().slideShadows) return;
                swiper.slides.forEach(slideEl => {
                    slideEl.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach(shadowEl => shadowEl.remove());
                });
                recreateShadows();
            }
        });
        let requireUpdateOnVirtual;
        on("virtualUpdate", () => {
            if (swiper.params.effect !== effect) return;
            if (!swiper.slides.length) requireUpdateOnVirtual = true;
            requestAnimationFrame(() => {
                if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
                    setTranslate();
                    requireUpdateOnVirtual = false;
                }
            });
        });
    }
    function effect_target_effectTarget(effectParams, slideEl) {
        const transformEl = utils_getSlideTransformEl(slideEl);
        if (transformEl !== slideEl) {
            transformEl.style.backfaceVisibility = "hidden";
            transformEl.style["-webkit-backface-visibility"] = "hidden";
        }
        return transformEl;
    }
    function effect_virtual_transition_end_effectVirtualTransitionEnd(_ref) {
        let {swiper, duration, transformElements, allSlides} = _ref;
        const {activeIndex} = swiper;
        const getSlide = el => {
            if (!el.parentElement) {
                const slide = swiper.slides.find(slideEl => slideEl.shadowRoot && slideEl.shadowRoot === el.parentNode);
                return slide;
            }
            return el.parentElement;
        };
        if (swiper.params.virtualTranslate && duration !== 0) {
            let eventTriggered = false;
            let transitionEndTarget;
            if (allSlides) transitionEndTarget = transformElements; else transitionEndTarget = transformElements.filter(transformEl => {
                const el = transformEl.classList.contains("swiper-slide-transform") ? getSlide(transformEl) : transformEl;
                return swiper.getSlideIndex(el) === activeIndex;
            });
            transitionEndTarget.forEach(el => {
                utils_elementTransitionEnd(el, () => {
                    if (eventTriggered) return;
                    if (!swiper || swiper.destroyed) return;
                    eventTriggered = true;
                    swiper.animating = false;
                    const evt = new window.CustomEvent("transitionend", {
                        bubbles: true,
                        cancelable: true
                    });
                    swiper.wrapperEl.dispatchEvent(evt);
                });
            });
        }
    }
    function EffectFade(_ref) {
        let {swiper, extendParams, on} = _ref;
        extendParams({
            fadeEffect: {
                crossFade: false
            }
        });
        const setTranslate = () => {
            const {slides} = swiper;
            const params = swiper.params.fadeEffect;
            for (let i = 0; i < slides.length; i += 1) {
                const slideEl = swiper.slides[i];
                const offset = slideEl.swiperSlideOffset;
                let tx = -offset;
                if (!swiper.params.virtualTranslate) tx -= swiper.translate;
                let ty = 0;
                if (!swiper.isHorizontal()) {
                    ty = tx;
                    tx = 0;
                }
                const slideOpacity = swiper.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(slideEl.progress), 0) : 1 + Math.min(Math.max(slideEl.progress, -1), 0);
                const targetEl = effect_target_effectTarget(params, slideEl);
                targetEl.style.opacity = slideOpacity;
                targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
            }
        };
        const setTransition = duration => {
            const transformElements = swiper.slides.map(slideEl => utils_getSlideTransformEl(slideEl));
            transformElements.forEach(el => {
                el.style.transitionDuration = `${duration}ms`;
            });
            effect_virtual_transition_end_effectVirtualTransitionEnd({
                swiper,
                duration,
                transformElements,
                allSlides: true
            });
        };
        effect_init_effectInit({
            effect: "fade",
            swiper,
            on,
            setTranslate,
            setTransition,
            overwriteParams: () => ({
                slidesPerView: 1,
                slidesPerGroup: 1,
                watchSlidesProgress: true,
                spaceBetween: 0,
                virtualTranslate: !swiper.params.cssMode
            })
        });
    }
    window.Swiper = swiper_core_Swiper;
    window.Pagination = Pagination;
    function initSliders() {
        if (document.querySelector(".hero-1__slider")) new swiper_core_Swiper(".hero-1__slider", {
            modules: [ Navigation, Pagination, EffectFade ],
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 0,
            speed: 800,
            loop: true,
            effect: "fade",
            autoplay: {
                delay: 3e3,
                disableOnInteraction: false
            },
            pagination: {
                el: ".hero-1__pagination",
                clickable: true
            },
            navigation: {
                prevEl: ".hero-1__button-prev",
                nextEl: ".hero-1__button-next"
            }
        });
        if (document.querySelector(".contacts__slider")) new swiper_core_Swiper(".contacts__slider", {
            modules: [ Pagination ],
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 20,
            speed: 800,
            loop: false,
            autoplay: {
                delay: 3e3,
                disableOnInteraction: true
            },
            pagination: {
                el: ".contacts__pagination",
                clickable: true
            }
        });
        if (document.querySelector(".product-slider__slider")) new swiper_core_Swiper(".product-slider__slider", {
            modules: [ Navigation ],
            observer: true,
            observeParents: true,
            slidesPerView: 4,
            spaceBetween: 20,
            speed: 800,
            loop: false,
            autoplay: {
                delay: 3e3,
                disableOnInteraction: true
            },
            navigation: {
                prevEl: ".product-slider__button-prev",
                nextEl: ".product-slider__button-next"
            },
            breakpoints: {
                320: {
                    slidesPerView: "auto",
                    spaceBetween: 15
                },
                1280: {
                    slidesPerView: 4,
                    spaceBetween: 0
                }
            }
        });
        if (document.querySelector(".product-gallery__gallery")) {
            const thumbsSwiper = new swiper_core_Swiper(".product-gallery__slider-thumb", {
                modules: [ Navigation ],
                direction: "vertical",
                slidesPerView: "auto",
                spaceBetween: 20,
                speed: 600,
                watchSlidesProgress: true,
                slideToClickedSlide: true,
                centeredSlides: true,
                centeredSlidesBounds: true,
                observer: true,
                observeParents: true,
                navigation: {
                    prevEl: ".product-gallery__button-prev",
                    nextEl: ".product-gallery__button-next"
                },
                breakpoints: {
                    0: {
                        direction: "horizontal"
                    },
                    1080: {
                        direction: "vertical"
                    }
                }
            });
            const mainSwiper = new swiper_core_Swiper(".product-gallery__gallery", {
                modules: [ Thumb ],
                observer: true,
                observeParents: true,
                slidesPerView: 1,
                spaceBetween: 10,
                speed: 600,
                loop: false,
                thumbs: {
                    swiper: thumbsSwiper
                }
            });
            thumbsSwiper.on("click", swiper => {
                const clickedIndex = swiper.clickedIndex;
                if (typeof clickedIndex === "number" && clickedIndex >= 0) swiper.slideTo(clickedIndex, 300);
            });
            mainSwiper.on("slideChange", () => {
                const idx = mainSwiper.realIndex;
                thumbsSwiper.slideTo(idx, 300);
            });
            thumbsSwiper.slideTo(mainSwiper.realIndex, 0);
            window.productGalleryMainSwiper = mainSwiper;
            window.productGalleryThumbsSwiper = thumbsSwiper;
        }
    }
    window.addEventListener("load", function(e) {
        initSliders();
    });
    let swiperInstance;
    function initSwiper() {
        if (window.innerWidth < 1280) {
            if (!swiperInstance && document.querySelector(".product-detail__slider")) swiperInstance = new swiper_core_Swiper(".product-detail__slider", {
                modules: [ Navigation, Pagination ],
                observer: true,
                observeParents: true,
                slidesPerView: "auto",
                speed: 800,
                loop: true,
                navigation: {
                    prevEl: ".product-detail__button-prev",
                    nextEl: ".product-detail__button-next"
                },
                pagination: {
                    el: ".product-detail__pagination",
                    clickable: true
                }
            });
        } else if (swiperInstance) {
            swiperInstance.destroy(true, true);
            swiperInstance = null;
        }
    }
    window.addEventListener("load", initSwiper);
    window.addEventListener("resize", initSwiper);
    let addWindowScrollEvent = false;
    setTimeout(() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", function(e) {
                document.dispatchEvent(windowScroll);
            });
        }
    }, 0);
    class DynamicAdapt {
        constructor(type) {
            this.type = type;
        }
        init() {
            this.оbjects = [];
            this.daClassname = "_dynamic_adapt_";
            this.nodes = [ ...document.querySelectorAll("[data-da]") ];
            this.nodes.forEach(node => {
                const data = node.dataset.da.trim();
                const dataArray = data.split(",");
                const оbject = {};
                оbject.element = node;
                оbject.parent = node.parentNode;
                оbject.destination = document.querySelector(`${dataArray[0].trim()}`);
                оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767.98";
                оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
                оbject.index = this.indexInParent(оbject.parent, оbject.element);
                this.оbjects.push(оbject);
            });
            this.arraySort(this.оbjects);
            this.mediaQueries = this.оbjects.map(({breakpoint}) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
            this.mediaQueries.forEach(media => {
                const mediaSplit = media.split(",");
                const matchMedia = window.matchMedia(mediaSplit[0]);
                const mediaBreakpoint = mediaSplit[1];
                const оbjectsFilter = this.оbjects.filter(({breakpoint}) => breakpoint === mediaBreakpoint);
                matchMedia.addEventListener("change", () => {
                    this.mediaHandler(matchMedia, оbjectsFilter);
                });
                this.mediaHandler(matchMedia, оbjectsFilter);
            });
        }
        mediaHandler(matchMedia, оbjects) {
            if (matchMedia.matches) оbjects.forEach(оbject => {
                this.moveTo(оbject.place, оbject.element, оbject.destination);
            }); else оbjects.forEach(({parent, element, index}) => {
                if (element.classList.contains(this.daClassname)) this.moveBack(parent, element, index);
            });
        }
        moveTo(place, element, destination) {
            element.classList.add(this.daClassname);
            if (place === "last" || place >= destination.children.length) {
                destination.append(element);
                return;
            }
            if (place === "first") {
                destination.prepend(element);
                return;
            }
            destination.children[place].before(element);
        }
        moveBack(parent, element, index) {
            element.classList.remove(this.daClassname);
            if (parent.children[index] !== void 0) parent.children[index].before(element); else parent.append(element);
        }
        indexInParent(parent, element) {
            return [ ...parent.children ].indexOf(element);
        }
        arraySort(arr) {
            if (this.type === "min") arr.sort((a, b) => {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) return 0;
                    if (a.place === "first" || b.place === "last") return -1;
                    if (a.place === "last" || b.place === "first") return 1;
                    return 0;
                }
                return a.breakpoint - b.breakpoint;
            }); else {
                arr.sort((a, b) => {
                    if (a.breakpoint === b.breakpoint) {
                        if (a.place === b.place) return 0;
                        if (a.place === "first" || b.place === "last") return 1;
                        if (a.place === "last" || b.place === "first") return -1;
                        return 0;
                    }
                    return b.breakpoint - a.breakpoint;
                });
                return;
            }
        }
    }
    const da = new DynamicAdapt("max");
    da.init();
    function updateProductSliderButtons() {
        const sliders = document.querySelectorAll(".product-slider");
        sliders.forEach(slider => {
            const image = slider.querySelector(".preview-product__image");
            if (image) {
                const imageHeight = image.offsetHeight;
                const topValue = imageHeight / 2;
                slider.querySelectorAll(".product-slider__button-prev, .product-slider__button-next").forEach(btn => {
                    btn.style.top = `${topValue}px`;
                });
                console.log(imageHeight);
            }
        });
    }
    window.addEventListener("load", updateProductSliderButtons);
    window.addEventListener("resize", updateProductSliderButtons);
    function updateHero1Background() {
        const header = document.querySelector(".header");
        const hero = document.querySelector(".hero-1");
        const background = document.querySelector(".hero-1__background");
        if (header && hero && background) {
            const headerHeight = header.offsetHeight;
            const heroHeight = hero.offsetHeight;
            const totalHeight = headerHeight + heroHeight;
            background.style.height = `${totalHeight}px`;
            background.style.top = `-${headerHeight}px`;
        }
    }
    window.addEventListener("load", updateHero1Background);
    window.addEventListener("resize", updateHero1Background);
    (function() {
        const MIN_WIDTH = 767;
        const body = document.body;
        let isSticky = false;
        let lastScrollY = 0;
        let scrollX = 0;
        let wasStickyActivated = false;
        function lockScroll() {
            body.style.overflow = "hidden";
        }
        function unlockScroll() {
            body.style.overflow = "";
        }
        function setSticky(sticky) {
            const advantages = document.querySelector(".advantages");
            if (!advantages) return;
            if (sticky && !isSticky && !wasStickyActivated) {
                advantages.getBoundingClientRect();
                advantages.classList.add("is-sticky");
                lockScroll();
                isSticky = true;
                wasStickyActivated = true;
            } else if (!sticky && isSticky) {
                advantages.classList.remove("is-sticky");
                unlockScroll();
                isSticky = false;
            }
        }
        function checkStickyEdges() {
            const scrollWrapper = document.querySelector(".advantages__scroll-wrapper");
            const list = document.querySelector(".advantages__list");
            if (!scrollWrapper || !list) return;
            const maxScroll = list.scrollWidth - scrollWrapper.clientWidth;
            if (scrollX <= 0) {
                scrollX = 0;
                list.style.transform = `translateX(0px)`;
                setSticky(false);
                window.scrollTo({
                    top: lastScrollY - 1
                });
            }
            if (Math.abs(scrollX - maxScroll) < 2) {
                scrollX = maxScroll;
                list.style.transform = `translateX(${-scrollX}px)`;
                setSticky(false);
                window.scrollTo({
                    top: lastScrollY + 1
                });
            }
        }
        function getVisiblePercent(elem) {
            const rect = elem.getBoundingClientRect();
            const height = rect.height;
            const visibleTop = Math.max(rect.top, 0);
            const visibleBottom = Math.min(rect.bottom, window.innerHeight);
            const visible = Math.max(0, visibleBottom - visibleTop);
            return visible / height;
        }
        function handleScroll() {
            if (window.innerWidth <= MIN_WIDTH) {
                setSticky(false);
                return;
            }
            const advantages = document.querySelector(".advantages");
            if (!advantages) return;
            const rect = advantages.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const advCenter = rect.top + rect.height / 2;
            if (!isSticky && !wasStickyActivated && advCenter <= viewportCenter + 10 && advCenter >= viewportCenter - 10) {
                lastScrollY = window.scrollY;
                setSticky(true);
            } else if (isSticky) if (rect.bottom < viewportCenter || rect.top > viewportCenter) setSticky(false);
            if (!isSticky && wasStickyActivated) {
                const visiblePercent = getVisiblePercent(advantages);
                if (visiblePercent < .4) wasStickyActivated = false;
            }
        }
        function handleWheel(e) {
            const advantages = document.querySelector(".advantages");
            if (!advantages) return;
            const rect = advantages.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const advCenter = rect.top + rect.height / 2;
            const activationZone = 50;
            if (!isSticky && !wasStickyActivated && window.innerWidth > MIN_WIDTH) {
                const isPartiallyVisible = rect.bottom > 0 && rect.top < window.innerHeight;
                if (isPartiallyVisible) {
                    if (e.deltaY > 0 && advCenter <= viewportCenter + activationZone && advCenter >= viewportCenter - activationZone && rect.top < viewportCenter) {
                        lastScrollY = window.scrollY;
                        setSticky(true);
                    }
                    if (e.deltaY < 0 && advCenter <= viewportCenter + activationZone && advCenter >= viewportCenter - activationZone && rect.bottom > viewportCenter) {
                        lastScrollY = window.scrollY;
                        setSticky(true);
                    }
                }
            }
            if (!isSticky || window.innerWidth <= MIN_WIDTH) return;
            const scrollWrapper = document.querySelector(".advantages__scroll-wrapper");
            const list = document.querySelector(".advantages__list");
            if (!scrollWrapper || !list) return;
            const maxScroll = list.scrollWidth - scrollWrapper.clientWidth;
            if (maxScroll <= 0) return;
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                scrollX += e.deltaY;
                scrollX = Math.max(0, Math.min(scrollX, maxScroll));
                list.style.transform = `translateX(${-scrollX}px)`;
                checkStickyEdges();
            }
        }
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);
        document.addEventListener("wheel", handleWheel, {
            passive: false
        });
    })();
    document.addEventListener("DOMContentLoaded", function() {
        const upBtn = document.querySelector(".footer__up");
        if (upBtn) upBtn.addEventListener("click", function() {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const links = document.querySelectorAll(".catalog-menu__link");
        const blocks = document.querySelectorAll(".catalog-menu__block");
        links.forEach(link => {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                links.forEach(l => l.classList.remove("_active"));
                this.classList.add("_active");
                const blockId = this.getAttribute("data-block");
                blocks.forEach(block => block.classList.remove("_active"));
                const targetBlock = document.querySelector('.catalog-menu__block[data-blockId="' + blockId + '"]');
                if (targetBlock) targetBlock.classList.add("_active");
            });
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const catalogBtn = document.querySelector(".header__catalog-btn");
        const catalogMenu = document.querySelector(".catalog-menu");
        if (catalogBtn && catalogMenu) catalogBtn.addEventListener("click", function() {
            catalogBtn.classList.toggle("_active");
            catalogMenu.classList.toggle("_active");
            if (catalogMenu.classList.contains("_active")) document.body.style.overflow = "hidden"; else document.body.style.overflow = "";
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const animatedHeadings = document.querySelectorAll(".animated-heading");
        if (!animatedHeadings.length) return;
        const animatedStates = new WeakMap;
        function isFullyVisible(elem) {
            const rect = elem.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        }
        function animateSpansForHeading(animatedHeading) {
            if (animatedStates.get(animatedHeading)) return;
            if (isFullyVisible(animatedHeading)) {
                const spans = animatedHeading.querySelectorAll("span");
                const baseDelay = parseInt(animatedHeading.getAttribute("data-animate-delay")) || 300;
                spans.forEach((span, idx) => {
                    span.classList.add("animate-word");
                    span.style.animationDelay = baseDelay + idx * 140 + "ms";
                });
                animatedHeading.classList.add("_visible");
                animatedStates.set(animatedHeading, true);
            }
        }
        function animateAllSpans() {
            animatedHeadings.forEach(heading => animateSpansForHeading(heading));
        }
        function onPreloaderDone() {
            window.removeEventListener("preloader:done", onPreloaderDone);
            window.addEventListener("scroll", animateAllSpans);
            window.addEventListener("resize", animateAllSpans);
            animateAllSpans();
        }
        const preloader = document.querySelector(".preloader");
        if (preloader) window.addEventListener("preloader:done", onPreloaderDone); else onPreloaderDone();
    });
    document.addEventListener("DOMContentLoaded", function() {
        const productSections = document.querySelectorAll(".animated-preview-product-wrapper");
        if (!productSections.length) return;
        const animatedSections = new WeakSet;
        function animateProductsInSection(section) {
            if (animatedSections.has(section)) return;
            const products = section.querySelectorAll(".animated-preview-product");
            products.forEach((product, idx) => {
                const image = product.querySelector(".preview-product__image");
                if (image) image.style.setProperty("--animation-delay", `${idx * 140}ms`);
                product.classList.add("_animated");
                const content = product.querySelector(".preview-product__content");
                if (content) {
                    content.style.animationDelay = `${idx * 140}ms`;
                    content.classList.add("animate__animated", "animate__fadeInUp");
                }
            });
            animatedSections.add(section);
            observer.unobserve(section);
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) animateProductsInSection(entry.target);
            });
        }, {
            threshold: .4
        });
        function onPreloaderDone() {
            window.removeEventListener("preloader:done", onPreloaderDone);
            productSections.forEach(section => observer.observe(section));
            productSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rect.top < windowHeight && rect.bottom > 0) animateProductsInSection(section);
            });
        }
        const preloader = document.querySelector(".preloader");
        if (preloader) window.addEventListener("preloader:done", onPreloaderDone); else onPreloaderDone();
    });
    (function() {
        document.addEventListener("DOMContentLoaded", function() {
            const animatedElems = Array.from(document.querySelectorAll("[data-animate-name]"));
            if (!animatedElems.length) return;
            animatedElems.forEach(elem => elem.style.opacity = "0");
            const animatedSet = new WeakSet;
            function isPartiallyVisible(elem, threshold = .6) {
                const rect = elem.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                const elemHeight = rect.height;
                const visibleTop = Math.max(rect.top, 0);
                const visibleBottom = Math.min(rect.bottom, windowHeight);
                const visible = Math.max(0, visibleBottom - visibleTop);
                return visible / elemHeight >= threshold;
            }
            function animateVisibleElems() {
                animatedElems.forEach(elem => {
                    if (!animatedSet.has(elem) && isPartiallyVisible(elem, .6)) {
                        const animName = elem.getAttribute("data-animate-name");
                        if (animName) {
                            elem.classList.add("animate__animated", animName);
                            elem.style.opacity = "";
                            animatedSet.add(elem);
                        }
                    }
                });
            }
            function onPreloaderDone() {
                window.removeEventListener("preloader:done", onPreloaderDone);
                window.addEventListener("scroll", animateVisibleElems);
                window.addEventListener("resize", animateVisibleElems);
                animateVisibleElems();
            }
            const preloader = document.querySelector(".preloader");
            if (preloader) window.addEventListener("preloader:done", onPreloaderDone); else onPreloaderDone();
        });
    })();
    document.addEventListener("DOMContentLoaded", function() {
        const togglerButtons = document.querySelectorAll(".menu__body-toggler-button");
        const menuLists = document.querySelectorAll(".menu__list");
        togglerButtons.forEach(button => {
            button.addEventListener("click", function() {
                togglerButtons.forEach(btn => btn.classList.remove("_active"));
                menuLists.forEach(list => list.classList.remove("_active"));
                this.classList.add("_active");
                const targetId = this.getAttribute("data-menu-list");
                const targetList = document.getElementById(targetId);
                if (targetList) targetList.classList.add("_active");
            });
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const menuLists = document.querySelectorAll(".menu__list");
        const togglerButtons = document.querySelectorAll(".menu__body-toggler-button");
        const submenus = document.querySelectorAll(".menu__submenu");
        const togglerWrapper = document.querySelector(".menu__body-toggler");
        document.querySelectorAll("[data-show-submenu]").forEach(link => {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                const submenuId = this.getAttribute("data-show-submenu");
                menuLists.forEach(list => list.classList.remove("_active"));
                togglerButtons.forEach(btn => btn.classList.remove("_active"));
                submenus.forEach(sub => sub.classList.remove("_active"));
                if (togglerWrapper) togglerWrapper.classList.remove("_active");
                const submenu = document.getElementById(submenuId);
                if (submenu) submenu.classList.add("_active");
            });
        });
        document.querySelectorAll(".menu__submenu-back").forEach(backBtn => {
            backBtn.addEventListener("click", function() {
                submenus.forEach(sub => sub.classList.remove("_active"));
                if (togglerWrapper) togglerWrapper.classList.add("_active");
                if (togglerButtons.length) togglerButtons[0].classList.add("_active");
                if (menuLists.length) menuLists[0].classList.add("_active");
            });
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const heads = document.querySelectorAll(".sidebar__head");
        heads.forEach(head => {
            head.addEventListener("click", function() {
                const parent = head.closest(".sidebar__part");
                if (parent) parent.classList.toggle("_active");
            });
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const filterBtn = document.querySelector(".catalog__filtr-btn");
        const filterClose = document.querySelector(".filter-close");
        const sidebar = document.querySelector(".catalog__sidebar.sidebar");
        if (filterBtn && sidebar) filterBtn.addEventListener("click", function() {
            sidebar.classList.add("_active");
            document.body.style.overflow = "hidden";
        });
        if (filterClose && sidebar) filterClose.addEventListener("click", function() {
            sidebar.classList.remove("_active");
            document.body.style.overflow = "";
        });
        if (sidebar) sidebar.addEventListener("click", function(e) {
            if (e.target === sidebar) {
                sidebar.classList.remove("_active");
                document.body.style.overflow = "";
            }
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const sliders = document.querySelectorAll(".product-slider");
        sliders.forEach(slider => {
            const tabs = Array.from(slider.querySelectorAll(".product-slider__tabs-item"));
            const groups = Array.from(slider.querySelectorAll(".product-slider__body-group"));
            if (!tabs.length || !groups.length) return;
            tabs.forEach((tab, index) => {
                tab.addEventListener("click", function() {
                    groups.forEach(g => {
                        g.querySelectorAll(".animated-preview-product").forEach(p => {
                            p.classList.remove("_animated");
                            const img = p.querySelector(".preview-product__image");
                            const content = p.querySelector(".preview-product__content");
                            if (img) img.style.setProperty("--animation-delay", "0ms");
                            if (content) content.style.setProperty("animation-delay", "0ms");
                        });
                    });
                    tabs.forEach(t => t.classList.remove("_active"));
                    this.classList.add("_active");
                    groups.forEach(g => g.classList.remove("_active"));
                    if (groups[index]) groups[index].classList.add("_active");
                    const activeGroup = groups[index];
                    if (activeGroup) {
                        const products = activeGroup.querySelectorAll(".animated-preview-product");
                        products.forEach((p, i) => {
                            const img = p.querySelector(".preview-product__image");
                            const content = p.querySelector(".preview-product__content");
                            if (img) img.style.setProperty("--animation-delay", `${i * 140}ms`);
                            if (content) content.style.setProperty("animation-delay", `${i * 140}ms`);
                        });
                        void activeGroup.offsetWidth;
                        products.forEach(p => p.classList.add("_animated"));
                    }
                });
            });
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const details = document.querySelectorAll(".product-detail__description-detail");
        details.forEach(detail => {
            detail.addEventListener("click", function() {
                const wrapper = this.closest(".product-detail__description-wrapper") || document.querySelector(".product-detail__description-wrapper");
                if (wrapper) {
                    wrapper.classList.add("_active");
                    detail.classList.remove("_active");
                }
            });
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const videos = document.querySelectorAll("video");
        if (!videos.length) return;
        videos.forEach(video => {
            video.muted = true;
            video.autoplay = true;
            video.playsInline = true;
            video.setAttribute("muted", "");
            video.setAttribute("autoplay", "");
            video.setAttribute("playsinline", "");
            const tryPlay = () => {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") playPromise.catch(() => {});
            };
            if (video.readyState >= 2) tryPlay(); else video.addEventListener("loadeddata", tryPlay, {
                once: true
            });
            const container = video.closest(".video-file__wrapper") || video.closest(".product-detail__gallery-video");
            if (container) {
                const updateState = () => {
                    if (video.paused) container.classList.remove("_playing"); else container.classList.add("_playing");
                };
                video.addEventListener("play", updateState);
                video.addEventListener("pause", updateState);
                updateState();
            }
        });
    });
    document.addEventListener("DOMContentLoaded", function() {
        const playButtons = document.querySelectorAll(".play-button");
        if (!playButtons.length) return;
        playButtons.forEach(button => {
            button.addEventListener("click", function(e) {
                e.preventDefault();
                const container = this.closest(".video-file__wrapper") || this.parentElement;
                if (!container) return;
                const video = container.querySelector("video, .video-file");
                if (!(video instanceof HTMLVideoElement)) return;
                if (video.paused) {
                    const playPromise = video.play();
                    if (playPromise && typeof playPromise.then === "function") playPromise.catch(() => {});
                    container.classList.add("_playing");
                    this.classList.remove("_paused");
                    this.setAttribute("aria-pressed", "true");
                } else {
                    video.pause();
                    container.classList.remove("_playing");
                    this.classList.add("_paused");
                    this.setAttribute("aria-pressed", "false");
                }
            });
        });
        const containers = document.querySelectorAll(".product-detail__gallery-video");
        containers.forEach(container => {
            const button = container.querySelector(".product-detail__play-button");
            const video = container.querySelector("video, .product-detail__gallery-img");
            if (!(button && video instanceof HTMLVideoElement)) return;
            function syncState() {
                if (video.paused) {
                    container.classList.remove("_playing");
                    button.classList.add("_paused");
                    button.setAttribute("aria-pressed", "false");
                } else {
                    container.classList.add("_playing");
                    button.classList.remove("_paused");
                    button.setAttribute("aria-pressed", "true");
                }
            }
            video.addEventListener("play", syncState);
            video.addEventListener("pause", syncState);
            syncState();
        });
    });
    document.addEventListener("DOMContentLoaded", () => {
        const popup = document.querySelector(".search-popup");
        if (!popup) return;
        const openBtns = document.querySelectorAll("[open-search-popup]");
        const closeBtn = popup.querySelector(".search-popup__close");
        const lockScroll = () => {
            document.body.style.overflow = "hidden";
        };
        const unlockScroll = () => {
            document.body.style.overflow = "";
        };
        const openPopup = () => {
            popup.classList.add("_active");
            lockScroll();
        };
        const closePopup = () => {
            popup.classList.remove("_active");
            unlockScroll();
        };
        openBtns.forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                openPopup();
            });
        });
        if (closeBtn) closeBtn.addEventListener("click", e => {
            e.preventDefault();
            closePopup();
        });
        popup.addEventListener("click", e => {
            if (e.target === popup) closePopup();
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && popup.classList.contains("_active")) closePopup();
        });
    });
    document.addEventListener("DOMContentLoaded", () => {
        const popup = document.querySelector(".product-gallery");
        if (!popup) return;
        const openBtns = document.querySelectorAll("[open-product-gallery]");
        const closeBtn = popup.querySelector(".product-gallery__close");
        let __pgTargetIndex = 0;
        document.addEventListener("click", e => {
            const trigger = e.target.closest("[open-product-gallery]");
            if (!trigger) return;
            let idx = 0;
            const slideEl = trigger.closest(".product-detail__slide") || trigger.closest(".swiper-slide");
            if (slideEl) {
                const dataIdx = slideEl.getAttribute("data-swiper-slide-index");
                if (dataIdx !== null && dataIdx !== void 0 && dataIdx !== "") {
                    const parsed = parseInt(dataIdx, 10);
                    if (!Number.isNaN(parsed) && parsed >= 0) idx = parsed;
                } else if (slideEl.parentElement) {
                    const slides = Array.from(slideEl.parentElement.children).filter(el => el.classList.contains("swiper-slide") && !el.classList.contains("swiper-slide-duplicate"));
                    const pos = slides.indexOf(slideEl);
                    if (pos >= 0) idx = pos;
                }
            }
            (function resolveIndexByMedia() {
                function getFileName(path) {
                    if (!path) return "";
                    try {
                        const clean = String(path).split("?")[0].split("#")[0];
                        return clean.substring(clean.lastIndexOf("/") + 1);
                    } catch (_) {
                        return "";
                    }
                }
                let mediaSrc = "";
                if (trigger instanceof HTMLImageElement) mediaSrc = trigger.getAttribute("src") || ""; else if (trigger instanceof HTMLVideoElement) mediaSrc = trigger.getAttribute("poster") || "";
                if (!mediaSrc && slideEl) {
                    const img = slideEl.querySelector("img");
                    const vid = slideEl.querySelector("video");
                    mediaSrc = vid && (vid.getAttribute("poster") || "") || img && (img.getAttribute("src") || "") || "";
                }
                const needle = getFileName(mediaSrc);
                if (needle) {
                    const popupSlidesMedia = Array.from(document.querySelectorAll(".product-gallery__gallery .swiper-slide img, .product-gallery__gallery .swiper-slide video"));
                    const foundIdx = popupSlidesMedia.findIndex(el => {
                        const src = el instanceof HTMLVideoElement ? el.getAttribute("poster") : el.getAttribute("src");
                        return getFileName(src || "") === needle;
                    });
                    if (foundIdx >= 0) idx = foundIdx;
                }
            })();
            __pgTargetIndex = idx;
        });
        const lockScroll = () => {
            document.body.style.overflow = "hidden";
        };
        const unlockScroll = () => {
            document.body.style.overflow = "";
        };
        const openPopup = () => {
            popup.classList.add("_active");
            lockScroll();
        };
        const closePopup = () => {
            popup.classList.remove("_active");
            unlockScroll();
        };
        openBtns.forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                openPopup();
            });
        });
        if (closeBtn) closeBtn.addEventListener("click", e => {
            e.preventDefault();
            closePopup();
        });
        popup.addEventListener("click", e => {
            if (e.target === popup) closePopup();
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && popup.classList.contains("_active")) closePopup();
        });
        const pgObserver = new MutationObserver(() => {
            if (!popup.classList.contains("_active")) return;
            const galleryEl = document.querySelector(".product-gallery__gallery");
            const mainSwiper = window.productGalleryMainSwiper || galleryEl && galleryEl.swiper;
            if (!mainSwiper) return;
            setTimeout(() => {
                if (typeof mainSwiper.update === "function") mainSwiper.update();
                mainSwiper.slideTo(__pgTargetIndex, 0, false);
                if (mainSwiper.thumbs && mainSwiper.thumbs.swiper) {
                    const ts = mainSwiper.thumbs.swiper;
                    if (typeof ts.update === "function") ts.update();
                    ts.slideTo(__pgTargetIndex, 0, false);
                }
            }, 10);
        });
        pgObserver.observe(popup, {
            attributes: true,
            attributeFilter: [ "class" ]
        });
    });
    document.addEventListener("click", async event => {
        const trigger = event.target.closest("[data-to-copy]");
        if (!trigger) return;
        const raw = trigger.getAttribute("data-to-copy")?.trim();
        if (!raw) return;
        let textToCopy = raw;
        try {
            const maybeEl = document.querySelector(raw);
            if (maybeEl) textToCopy = (maybeEl.innerText || maybeEl.textContent || "").trim();
        } catch (_) {}
        if (!textToCopy) return;
        try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(textToCopy); else {
                const ta = document.createElement("textarea");
                ta.value = textToCopy;
                ta.style.position = "fixed";
                ta.style.top = "-9999px";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand("copy");
                ta.remove();
            }
            if (!trigger.dataset.copyOriginal) trigger.dataset.copyOriginal = (trigger.innerText || trigger.textContent || "").trim();
            trigger.textContent = "Скопировано";
            trigger.classList.add("_copied");
        } catch (err) {
            console.error("Не удалось скопировать:", err);
        }
    });
    document.addEventListener("DOMContentLoaded", function() {
        const counters = document.querySelectorAll("[data-counter]");
        if (!counters.length) return;
        counters.forEach(counter => {
            const input = counter.querySelector(".counter__input");
            const minus = counter.querySelector(".counter__btn--minus");
            const plus = counter.querySelector(".counter__btn--plus");
            if (!input || !minus || !plus) return;
            const getMin = () => parseInt(input.getAttribute("min") || "1", 10);
            const getStep = () => parseInt(input.getAttribute("step") || "1", 10);
            const getMax = () => {
                const m = input.getAttribute("max");
                return m ? parseInt(m, 10) : 1 / 0;
            };
            const clamp = v => Math.min(Math.max(v, getMin()), getMax());
            minus.addEventListener("click", () => {
                const next = clamp((parseInt(input.value || "0", 10) || 0) - getStep());
                input.value = next;
                input.dispatchEvent(new Event("change", {
                    bubbles: true
                }));
            });
            plus.addEventListener("click", () => {
                const next = clamp((parseInt(input.value || "0", 10) || 0) + getStep());
                input.value = next;
                input.dispatchEvent(new Event("change", {
                    bubbles: true
                }));
            });
            input.addEventListener("input", () => {
                input.value = (input.value || "").replace(/\D+/g, "");
            });
            input.addEventListener("blur", () => {
                input.value = clamp(parseInt(input.value || "0", 10) || getMin());
            });
        });
    });
    var x, i, j, l, ll, selElmnt, a, b, c;
    x = document.getElementsByClassName("custom-select");
    l = x.length;
    for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function(e) {
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) y[k].removeAttribute("class");
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }
    function closeAllSelect(elmnt) {
        var x, y, i, xl, yl, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;
        for (i = 0; i < yl; i++) if (elmnt == y[i]) arrNo.push(i); else y[i].classList.remove("select-arrow-active");
        for (i = 0; i < xl; i++) if (arrNo.indexOf(i)) x[i].classList.add("select-hide");
    }
    document.addEventListener("click", closeAllSelect);
    document.addEventListener("DOMContentLoaded", function() {
        const minInput = document.getElementById("min-input");
        const maxInput = document.getElementById("max-input");
        const rangeMin = document.getElementById("range-min");
        const rangeMax = document.getElementById("range-max");
        const trackFill = document.querySelector(".range-track-fill");
        if (!minInput || !maxInput || !rangeMin || !rangeMax || !trackFill) return;
        const minGap = 1;
        const sliderMaxValue = parseInt(rangeMin.max);
        function updateTrackFill() {
            const min = parseInt(rangeMin.value);
            const max = parseInt(rangeMax.value);
            const range = sliderMaxValue - parseInt(rangeMin.min);
            const percentMin = (min - rangeMin.min) / range * 100;
            const percentMax = (max - rangeMax.min) / range * 100;
            trackFill.style.left = percentMin + "%";
            trackFill.style.width = percentMax - percentMin + "%";
        }
        function syncInputs(e) {
            let minVal = parseInt(rangeMin.value);
            let maxVal = parseInt(rangeMax.value);
            if (maxVal - minVal < minGap) if (e.target === rangeMin) rangeMin.value = maxVal - minGap; else rangeMax.value = minVal + minGap;
            minInput.value = rangeMin.value;
            maxInput.value = rangeMax.value;
            updateTrackFill();
        }
        function syncSliders() {
            let minVal = parseInt(minInput.value);
            let maxVal = parseInt(maxInput.value);
            if (maxVal - minVal >= minGap && maxVal <= sliderMaxValue) {
                rangeMin.value = minVal;
                rangeMax.value = maxVal;
                updateTrackFill();
            }
        }
        rangeMin.addEventListener("input", syncInputs);
        rangeMax.addEventListener("input", syncInputs);
        minInput.addEventListener("change", syncSliders);
        maxInput.addEventListener("change", syncSliders);
        updateTrackFill();
    });
    /*! UIkit 3.23.12 | https://www.getuikit.com | (c) 2014 - 2025 YOOtheme | MIT License */ (function(Se, Ie) {
        typeof exports == "object" && typeof module < "u" ? module.exports = Ie() : typeof define == "function" && define.amd ? define("uikit", Ie) : (Se = typeof globalThis < "u" ? globalThis : Se || self, 
        Se.UIkit = Ie());
    })(void 0, function() {
        "use strict";
        const {hasOwnProperty: Se, toString: Ie} = Object.prototype;
        function gt(t, e) {
            return Se.call(t, e);
        }
        const lr = /\B([A-Z])/g, Ft = ct(t => t.replace(lr, "-$1").toLowerCase()), hr = /-(\w)/g, Ee = ct(t => (t.charAt(0).toLowerCase() + t.slice(1)).replace(hr, (e, i) => i.toUpperCase())), Ht = ct(t => t.charAt(0).toUpperCase() + t.slice(1));
        function wt(t, e) {
            var i;
            return (i = t == null ? void 0 : t.startsWith) == null ? void 0 : i.call(t, e);
        }
        function oe(t, e) {
            var i;
            return (i = t == null ? void 0 : t.endsWith) == null ? void 0 : i.call(t, e);
        }
        function v(t, e) {
            var i;
            return (i = t == null ? void 0 : t.includes) == null ? void 0 : i.call(t, e);
        }
        function xt(t, e) {
            var i;
            return (i = t == null ? void 0 : t.findIndex) == null ? void 0 : i.call(t, e);
        }
        const {isArray: J, from: re} = Array, {assign: ft} = Object;
        function ot(t) {
            return typeof t == "function";
        }
        function Ct(t) {
            return t !== null && typeof t == "object";
        }
        function Te(t) {
            return Ie.call(t) === "[object Object]";
        }
        function si(t) {
            return Ct(t) && t === t.window;
        }
        function Ce(t) {
            return Wi(t) === 9;
        }
        function Pe(t) {
            return Wi(t) >= 1;
        }
        function ae(t) {
            return Wi(t) === 1;
        }
        function Wi(t) {
            return !si(t) && Ct(t) && t.nodeType;
        }
        function le(t) {
            return typeof t == "boolean";
        }
        function H(t) {
            return typeof t == "string";
        }
        function _e(t) {
            return typeof t == "number";
        }
        function mt(t) {
            return _e(t) || H(t) && !isNaN(t - parseFloat(t));
        }
        function ni(t) {
            return !(J(t) ? t.length : Ct(t) && Object.keys(t).length);
        }
        function X(t) {
            return t === void 0;
        }
        function ji(t) {
            return le(t) ? t : t === "true" || t === "1" || t === "" ? !0 : t === "false" || t === "0" ? !1 : t;
        }
        function $t(t) {
            const e = Number(t);
            return isNaN(e) ? !1 : e;
        }
        function S(t) {
            return parseFloat(t) || 0;
        }
        function R(t) {
            return t && E(t)[0];
        }
        function E(t) {
            return Pe(t) ? [ t ] : Array.from(t || []).filter(Pe);
        }
        function Lt(t) {
            if (si(t)) return t;
            t = R(t);
            const e = Ce(t) ? t : t == null ? void 0 : t.ownerDocument;
            return (e == null ? void 0 : e.defaultView) || window;
        }
        function Ae(t, e) {
            return t === e || Ct(t) && Ct(e) && Object.keys(t).length === Object.keys(e).length && he(t, (i, s) => i === e[s]);
        }
        function Ri(t, e, i) {
            return t.replace(new RegExp(`${e}|${i}`, "g"), s => s === e ? i : e);
        }
        function Wt(t) {
            return t[t.length - 1];
        }
        function he(t, e) {
            for (const i in t) if (e(t[i], i) === !1) return !1;
            return !0;
        }
        function Vs(t, e) {
            return t.slice().sort(({[e]: i = 0}, {[e]: s = 0}) => i > s ? 1 : s > i ? -1 : 0);
        }
        function jt(t, e) {
            return t.reduce((i, s) => i + S(ot(e) ? e(s) : s[e]), 0);
        }
        function Ys(t, e) {
            const i = new Set;
            return t.filter(({[e]: s}) => i.has(s) ? !1 : i.add(s));
        }
        function oi(t, e) {
            return e.reduce((i, s) => ({
                ...i,
                [s]: t[s]
            }), {});
        }
        function K(t, e = 0, i = 1) {
            return Math.min(Math.max($t(t) || 0, e), i);
        }
        function A() {}
        function ri(...t) {
            return [ [ "bottom", "top" ], [ "right", "left" ] ].every(([e, i]) => Math.min(...t.map(({[e]: s}) => s)) - Math.max(...t.map(({[i]: s}) => s)) > 0);
        }
        function ai(t, e) {
            return t.x <= e.right && t.x >= e.left && t.y <= e.bottom && t.y >= e.top;
        }
        function qi(t, e, i) {
            const s = e === "width" ? "height" : "width";
            return {
                [s]: t[e] ? Math.round(i * t[s] / t[e]) : t[s],
                [e]: i
            };
        }
        function Gs(t, e) {
            t = {
                ...t
            };
            for (const i in t) t = t[i] > e[i] ? qi(t, i, e[i]) : t;
            return t;
        }
        function cr(t, e) {
            t = Gs(t, e);
            for (const i in t) t = t[i] < e[i] ? qi(t, i, e[i]) : t;
            return t;
        }
        const Ui = {
            ratio: qi,
            contain: Gs,
            cover: cr
        };
        function rt(t, e, i = 0, s = !1) {
            e = E(e);
            const {length: n} = e;
            return n ? (t = mt(t) ? $t(t) : t === "next" ? i + 1 : t === "previous" ? i - 1 : t === "last" ? n - 1 : e.indexOf(R(t)), 
            s ? K(t, 0, n - 1) : (t %= n, t < 0 ? t + n : t)) : -1;
        }
        function ct(t) {
            const e = Object.create(null);
            return (i, ...s) => e[i] || (e[i] = t(i, ...s));
        }
        function I(t, ...e) {
            for (const i of E(t)) {
                const s = Rt(e).filter(n => !$(i, n));
                s.length && i.classList.add(...s);
            }
        }
        function _(t, ...e) {
            for (const i of E(t)) {
                const s = Rt(e).filter(n => $(i, n));
                s.length && i.classList.remove(...s);
            }
        }
        function li(t, e, i) {
            i = Rt(i), e = Rt(e).filter(s => !v(i, s)), _(t, e), I(t, i);
        }
        function $(t, e) {
            return [e] = Rt(e), E(t).some(i => i.classList.contains(e));
        }
        function L(t, e, i) {
            const s = Rt(e);
            X(i) || (i = !!i);
            for (const n of E(t)) for (const o of s) n.classList.toggle(o, i);
        }
        function Rt(t) {
            return t ? J(t) ? t.map(Rt).flat() : String(t).split(" ").filter(Boolean) : [];
        }
        function k(t, e, i) {
            var s;
            if (Ct(e)) {
                for (const n in e) k(t, n, e[n]);
                return;
            }
            if (X(i)) return (s = R(t)) == null ? void 0 : s.getAttribute(e);
            for (const n of E(t)) ot(i) && (i = i.call(n, k(n, e))), i === null ? Oe(n, e) : n.setAttribute(e, i);
        }
        function Pt(t, e) {
            return E(t).some(i => i.hasAttribute(e));
        }
        function Oe(t, e) {
            E(t).forEach(i => i.removeAttribute(e));
        }
        function Z(t, e) {
            for (const i of [ e, `data-${e}` ]) if (Pt(t, i)) return k(t, i);
        }
        const qt = typeof window < "u", U = qt && document.dir === "rtl", ce = qt && "ontouchstart" in window, ue = qt && window.PointerEvent, ut = ue ? "pointerdown" : ce ? "touchstart" : "mousedown", Me = ue ? "pointermove" : ce ? "touchmove" : "mousemove", _t = ue ? "pointerup" : ce ? "touchend" : "mouseup", At = ue ? "pointerenter" : ce ? "" : "mouseenter", Ut = ue ? "pointerleave" : ce ? "" : "mouseleave", hi = ue ? "pointercancel" : "touchcancel", ur = {
            area: !0,
            base: !0,
            br: !0,
            col: !0,
            embed: !0,
            hr: !0,
            img: !0,
            input: !0,
            keygen: !0,
            link: !0,
            meta: !0,
            param: !0,
            source: !0,
            track: !0,
            wbr: !0
        };
        function Vi(t) {
            return E(t).some(e => ur[e.tagName.toLowerCase()]);
        }
        const dr = qt && Element.prototype.checkVisibility || function() {
            return this.offsetWidth || this.offsetHeight || this.getClientRects().length;
        };
        function q(t) {
            return E(t).some(e => dr.call(e));
        }
        const De = "input,select,textarea,button";
        function ci(t) {
            return E(t).some(e => C(e, De));
        }
        const de = `${De},a[href],[tabindex]`;
        function Be(t) {
            return C(t, de);
        }
        function O(t) {
            var e;
            return (e = R(t)) == null ? void 0 : e.parentElement;
        }
        function Ne(t, e) {
            return E(t).filter(i => C(i, e));
        }
        function C(t, e) {
            return E(t).some(i => i.matches(e));
        }
        function fe(t, e) {
            const i = [];
            for (;t = O(t); ) (!e || C(t, e)) && i.push(t);
            return i;
        }
        function N(t, e) {
            t = R(t);
            const i = t ? re(t.children) : [];
            return e ? Ne(i, e) : i;
        }
        function yt(t, e) {
            return e ? E(t).indexOf(R(e)) : N(O(t)).indexOf(t);
        }
        function Vt(t) {
            return t = R(t), t && [ "origin", "pathname", "search" ].every(e => t[e] === location[e]);
        }
        function ui(t) {
            if (Vt(t)) {
                const {hash: e, ownerDocument: i} = R(t), s = decodeURIComponent(e).slice(1);
                return s ? i.getElementById(s) || i.getElementsByName(s)[0] : i.documentElement;
            }
        }
        function et(t, e) {
            return Yi(t, Xs(t, e));
        }
        function ze(t, e) {
            return Fe(t, Xs(t, e));
        }
        function Yi(t, e) {
            return R(Zs(t, R(e), "querySelector"));
        }
        function Fe(t, e) {
            return E(Zs(t, R(e), "querySelectorAll"));
        }
        function Xs(t, e = document) {
            return Ce(e) || Js(t).isContextSelector ? e : e.ownerDocument;
        }
        const fr = /([!>+~-])(?=\s+[!>+~-]|\s*$)/g, pr = /(\([^)]*\)|[^,])+/g, Js = ct(t => {
            let e = !1;
            if (!t || !H(t)) return {};
            const i = [];
            for (let s of t.match(pr)) s = s.trim().replace(fr, "$1 *"), e || (e = [ "!", "+", "~", "-", ">" ].includes(s[0])), 
            i.push(s);
            return {
                selector: i.join(","),
                selectors: i,
                isContextSelector: e
            };
        }), gr = /(\([^)]*\)|\S)*/, Ks = ct(t => {
            t = t.slice(1).trim();
            const [e] = t.match(gr);
            return [ e, t.slice(e.length + 1) ];
        });
        function Zs(t, e = document, i) {
            var s;
            const n = Js(t);
            if (!n.isContextSelector) return n.selector ? Gi(e, i, n.selector) : t;
            t = "";
            const o = n.selectors.length === 1;
            for (let r of n.selectors) {
                let a, l = e;
                if (r[0] === "!" && ([a, r] = Ks(r), l = (s = e.parentElement) == null ? void 0 : s.closest(a), 
                !r && o) || l && r[0] === "-" && ([a, r] = Ks(r), l = l.previousElementSibling, 
                l = C(l, a) ? l : null, !r && o)) return l;
                if (l) {
                    if (o) return r[0] === "~" || r[0] === "+" ? (r = `:scope > :nth-child(${yt(l) + 1}) ${r}`, 
                    l = l.parentElement) : r[0] === ">" && (r = `:scope ${r}`), Gi(l, i, r);
                    t += `${t ? "," : ""}${mr(l)} ${r}`;
                }
            }
            return Ce(e) || (e = e.ownerDocument), Gi(e, i, t);
        }
        function Gi(t, e, i) {
            try {
                return t[e](i);
            } catch {
                return null;
            }
        }
        function mr(t) {
            const e = [];
            for (;t.parentNode; ) {
                const i = k(t, "id");
                if (i) {
                    e.unshift(`#${Xi(i)}`);
                    break;
                } else {
                    let {tagName: s} = t;
                    s !== "HTML" && (s += `:nth-child(${yt(t) + 1})`), e.unshift(s), t = t.parentNode;
                }
            }
            return e.join(" > ");
        }
        function Xi(t) {
            return H(t) ? CSS.escape(t) : "";
        }
        function w(...t) {
            let [e, i, s, n, o = !1] = Ji(t);
            n.length > 1 && (n = br(n)), o != null && o.self && (n = wr(n)), s && (n = vr(s, n));
            for (const r of i) for (const a of e) a.addEventListener(r, n, o);
            return () => Yt(e, i, n, o);
        }
        function Yt(...t) {
            let [e, i, , s, n = !1] = Ji(t);
            for (const o of i) for (const r of e) r.removeEventListener(o, s, n);
        }
        function z(...t) {
            const [e, i, s, n, o = !1, r] = Ji(t), a = w(e, i, s, l => {
                const c = !r || r(l);
                c && (a(), n(l, c));
            }, o);
            return a;
        }
        function m(t, e, i) {
            return Ki(t).every(s => s.dispatchEvent(pe(e, !0, !0, i)));
        }
        function pe(t, e = !0, i = !1, s) {
            return H(t) && (t = new CustomEvent(t, {
                bubbles: e,
                cancelable: i,
                detail: s
            })), t;
        }
        function Ji(t) {
            return t[0] = Ki(t[0]), H(t[1]) && (t[1] = t[1].split(" ")), ot(t[2]) && t.splice(2, 0, !1), 
            t;
        }
        function vr(t, e) {
            return i => {
                const s = t[0] === ">" ? Fe(t, i.currentTarget).reverse().find(n => n.contains(i.target)) : i.target.closest(t);
                s && (i.current = s, e.call(this, i), delete i.current);
            };
        }
        function br(t) {
            return e => J(e.detail) ? t(e, ...e.detail) : t(e);
        }
        function wr(t) {
            return function(e) {
                if (e.target === e.currentTarget || e.target === e.current) return t.call(null, e);
            };
        }
        function Qs(t) {
            return t && "addEventListener" in t;
        }
        function xr(t) {
            return Qs(t) ? t : R(t);
        }
        function Ki(t) {
            return J(t) ? t.map(xr).filter(Boolean) : H(t) ? Fe(t) : Qs(t) ? [ t ] : E(t);
        }
        function pt(t) {
            return t.pointerType === "touch" || !!t.touches;
        }
        function kt(t) {
            var e, i;
            const {clientX: s, clientY: n} = ((e = t.touches) == null ? void 0 : e[0]) || ((i = t.changedTouches) == null ? void 0 : i[0]) || t;
            return {
                x: s,
                y: n
            };
        }
        const $r = {
            "animation-iteration-count": !0,
            "column-count": !0,
            "fill-opacity": !0,
            "flex-grow": !0,
            "flex-shrink": !0,
            "font-weight": !0,
            "line-height": !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            "stroke-dasharray": !0,
            "stroke-dashoffset": !0,
            widows: !0,
            "z-index": !0,
            zoom: !0
        };
        function h(t, e, i, s) {
            const n = E(t);
            for (const o of n) if (H(e)) {
                if (e = di(e), X(i)) return getComputedStyle(o).getPropertyValue(e);
                o.style.setProperty(e, mt(i) && !$r[e] && !tn(e) ? `${i}px` : i || _e(i) ? i : "", s);
            } else if (J(e)) {
                const r = {};
                for (const a of e) r[a] = h(o, a);
                return r;
            } else if (Ct(e)) for (const r in e) h(o, r, e[r], i);
            return n[0];
        }
        function St(t, e) {
            for (const i in e) h(t, i, "");
        }
        const di = ct(t => {
            if (tn(t)) return t;
            t = Ft(t);
            const {style: e} = document.documentElement;
            if (t in e) return t;
            for (const i of [ "webkit", "moz" ]) {
                const s = `-${i}-${t}`;
                if (s in e) return s;
            }
        });
        function tn(t) {
            return wt(t, "--");
        }
        const Zi = "uk-transition", Qi = "transitionend", ts = "transitioncanceled";
        function yr(t, e, i = 400, s = "linear") {
            return i = Math.round(i), Promise.all(E(t).map(n => new Promise((o, r) => {
                for (const c in e) h(n, c);
                const a = setTimeout(() => m(n, Qi), i);
                z(n, [ Qi, ts ], ({type: c}) => {
                    clearTimeout(a), _(n, Zi), St(n, l), c === ts ? r() : o(n);
                }, {
                    self: !0
                }), I(n, Zi);
                const l = {
                    transitionProperty: Object.keys(e).map(di).join(","),
                    transitionDuration: `${i}ms`,
                    transitionTimingFunction: s
                };
                h(n, {
                    ...l,
                    ...e
                });
            })));
        }
        const M = {
            start: yr,
            async stop(t) {
                m(t, Qi), await Promise.resolve();
            },
            async cancel(t) {
                m(t, ts), await Promise.resolve();
            },
            inProgress(t) {
                return $(t, Zi);
            }
        }, He = "uk-animation", en = "animationend", fi = "animationcanceled";
        function sn(t, e, i = 200, s, n) {
            return Promise.all(E(t).map(o => new Promise((r, a) => {
                $(o, He) && m(o, fi);
                const l = [ e, He, `${He}-${n ? "leave" : "enter"}`, s && `uk-transform-origin-${s}`, n && `${He}-reverse` ], c = setTimeout(() => m(o, en), i);
                z(o, [ en, fi ], ({type: u}) => {
                    clearTimeout(c), u === fi ? a() : r(o), h(o, "animationDuration", ""), _(o, l);
                }, {
                    self: !0
                }), h(o, "animationDuration", `${i}ms`), I(o, l);
            })));
        }
        const Ot = {
            in: sn,
            out(t, e, i, s) {
                return sn(t, e, i, s, !0);
            },
            inProgress(t) {
                return $(t, He);
            },
            cancel(t) {
                m(t, fi);
            }
        };
        function kr(t) {
            if (document.readyState !== "loading") {
                t();
                return;
            }
            z(document, "DOMContentLoaded", t);
        }
        function F(t, ...e) {
            return e.some(i => {
                var s;
                return ((s = t == null ? void 0 : t.tagName) == null ? void 0 : s.toLowerCase()) === i.toLowerCase();
            });
        }
        function nn(t) {
            return t = x(t), t && (t.innerHTML = ""), t;
        }
        function vt(t, e) {
            return X(e) ? x(t).innerHTML : W(nn(t), e);
        }
        const Sr = mi("prepend"), W = mi("append"), pi = mi("before"), gi = mi("after");
        function mi(t) {
            return function(e, i) {
                var s;
                const n = E(H(i) ? It(i) : i);
                return (s = x(e)) == null || s[t](...n), on(n);
            };
        }
        function Q(t) {
            E(t).forEach(e => e.remove());
        }
        function Le(t, e) {
            for (e = R(pi(t, e)); e.firstElementChild; ) e = e.firstElementChild;
            return W(e, t), e;
        }
        function es(t, e) {
            return E(E(t).map(i => i.hasChildNodes() ? Le(re(i.childNodes), e) : W(i, e)));
        }
        function We(t) {
            E(t).map(O).filter((e, i, s) => s.indexOf(e) === i).forEach(e => e.replaceWith(...e.childNodes));
        }
        const Ir = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
        function It(t) {
            const e = Ir.exec(t);
            if (e) return document.createElement(e[1]);
            const i = document.createElement("template");
            return i.innerHTML = t.trim(), on(i.content.childNodes);
        }
        function on(t) {
            return t.length > 1 ? t : t[0];
        }
        function Mt(t, e) {
            if (ae(t)) for (e(t), t = t.firstElementChild; t; ) Mt(t, e), t = t.nextElementSibling;
        }
        function x(t, e) {
            return rn(t) ? R(It(t)) : Yi(t, e);
        }
        function D(t, e) {
            return rn(t) ? E(It(t)) : Fe(t, e);
        }
        function rn(t) {
            return H(t) && wt(t.trim(), "<");
        }
        const Gt = {
            width: [ "left", "right" ],
            height: [ "top", "bottom" ]
        };
        function g(t) {
            const e = ae(t) ? R(t).getBoundingClientRect() : {
                height: tt(t),
                width: vi(t),
                top: 0,
                left: 0
            };
            return {
                height: e.height,
                width: e.width,
                top: e.top,
                left: e.left,
                bottom: e.top + e.height,
                right: e.left + e.width
            };
        }
        function T(t, e) {
            e && h(t, {
                left: 0,
                top: 0
            });
            const i = g(t);
            if (t) {
                const {scrollY: s, scrollX: n} = Lt(t), o = {
                    height: s,
                    width: n
                };
                for (const r in Gt) for (const a of Gt[r]) i[a] += o[r];
            }
            if (!e) return i;
            for (const s of [ "left", "top" ]) h(t, s, e[s] - i[s]);
        }
        function is(t) {
            let {top: e, left: i} = T(t);
            const {ownerDocument: {body: s, documentElement: n}, offsetParent: o} = R(t);
            let r = o || n;
            for (;r && (r === s || r === n) && h(r, "position") === "static"; ) r = r.parentNode;
            if (ae(r)) {
                const a = T(r);
                e -= a.top + S(h(r, "borderTopWidth")), i -= a.left + S(h(r, "borderLeftWidth"));
            }
            return {
                top: e - S(h(t, "marginTop")),
                left: i - S(h(t, "marginLeft"))
            };
        }
        function je(t) {
            t = R(t);
            const e = [ t.offsetTop, t.offsetLeft ];
            for (;t = t.offsetParent; ) if (e[0] += t.offsetTop + S(h(t, "borderTopWidth")), 
            e[1] += t.offsetLeft + S(h(t, "borderLeftWidth")), h(t, "position") === "fixed") {
                const i = Lt(t);
                return e[0] += i.scrollY, e[1] += i.scrollX, e;
            }
            return e;
        }
        const tt = an("height"), vi = an("width");
        function an(t) {
            const e = Ht(t);
            return (i, s) => {
                if (X(s)) {
                    if (si(i)) return i[`inner${e}`];
                    if (Ce(i)) {
                        const n = i.documentElement;
                        return Math.max(n[`offset${e}`], n[`scroll${e}`]);
                    }
                    return i = R(i), s = h(i, t), s = s === "auto" ? i[`offset${e}`] : S(s) || 0, s - ge(i, t);
                } else return h(i, t, !s && s !== 0 ? "" : +s + ge(i, t) + "px");
            };
        }
        function ge(t, e, i = "border-box") {
            return h(t, "boxSizing") === i ? jt(Gt[e], s => S(h(t, `padding-${s}`)) + S(h(t, `border-${s}-width`))) : 0;
        }
        function bi(t) {
            for (const e in Gt) for (const i in Gt[e]) if (Gt[e][i] === t) return Gt[e][1 - i];
            return t;
        }
        function G(t, e = "width", i = window, s = !1) {
            return H(t) ? jt(Tr(t), n => {
                const o = Pr(n);
                return o ? _r(o === "vh" ? Ar() : o === "vw" ? vi(Lt(i)) : s ? i[`offset${Ht(e)}`] : g(i)[e], n) : n;
            }) : S(t);
        }
        const Er = /-?\d+(?:\.\d+)?(?:v[wh]|%|px)?/g, Tr = ct(t => t.toString().replace(/\s/g, "").match(Er) || []), Cr = /(?:v[hw]|%)$/, Pr = ct(t => (t.match(Cr) || [])[0]);
        function _r(t, e) {
            return t * S(e) / 100;
        }
        let Re, me;
        function Ar() {
            return Re || (me || (me = x("<div>"), h(me, {
                height: "100vh",
                position: "fixed"
            }), w(window, "resize", () => Re = null)), W(document.body, me), Re = me.clientHeight, 
            Q(me), Re);
        }
        const Dt = {
            read: Or,
            write: Mr,
            clear: Dr,
            flush: ln
        }, wi = [], xi = [];
        function Or(t) {
            return wi.push(t), ns(), t;
        }
        function Mr(t) {
            return xi.push(t), ns(), t;
        }
        function Dr(t) {
            cn(wi, t), cn(xi, t);
        }
        let ss = !1;
        function ln() {
            hn(wi), hn(xi.splice(0)), ss = !1, (wi.length || xi.length) && ns();
        }
        function ns() {
            ss || (ss = !0, queueMicrotask(ln));
        }
        function hn(t) {
            let e;
            for (;e = t.shift(); ) try {
                e();
            } catch (i) {
                console.error(i);
            }
        }
        function cn(t, e) {
            const i = t.indexOf(e);
            return ~i && t.splice(i, 1);
        }
        class un {
            init() {
                this.positions = [];
                let e;
                this.unbind = w(document, "mousemove", i => e = kt(i)), this.interval = setInterval(() => {
                    e && (this.positions.push(e), this.positions.length > 5 && this.positions.shift());
                }, 50);
            }
            cancel() {
                var e;
                (e = this.unbind) == null || e.call(this), clearInterval(this.interval);
            }
            movesTo(e) {
                if (!this.positions || this.positions.length < 2) return !1;
                const i = g(e), {left: s, right: n, top: o, bottom: r} = i, [a] = this.positions, l = Wt(this.positions), c = [ a, l ];
                return ai(l, i) ? !1 : [ [ {
                    x: s,
                    y: o
                }, {
                    x: n,
                    y: r
                } ], [ {
                    x: s,
                    y: r
                }, {
                    x: n,
                    y: o
                } ] ].some(d => {
                    const f = Br(c, d);
                    return f && ai(f, i);
                });
            }
        }
        function Br([{x: t, y: e}, {x: i, y: s}], [{x: n, y: o}, {x: r, y: a}]) {
            const l = (a - o) * (i - t) - (r - n) * (s - e);
            if (l === 0) return !1;
            const c = ((r - n) * (e - o) - (a - o) * (t - n)) / l;
            return c < 0 ? !1 : {
                x: t + c * (i - t),
                y: e + c * (s - e)
            };
        }
        function dn(t, e, i = {}, {intersecting: s = !0} = {}) {
            const n = new IntersectionObserver(s ? (o, r) => {
                o.some(a => a.isIntersecting) && e(o, r);
            } : e, i);
            for (const o of E(t)) n.observe(o);
            return n;
        }
        const Nr = qt && window.ResizeObserver;
        function qe(t, e, i = {
            box: "border-box"
        }) {
            if (Nr) return fn(ResizeObserver, t, e, i);
            const s = [ w(window, "load resize", e), w(document, "loadedmetadata load", e, !0) ];
            return {
                disconnect: () => s.map(n => n())
            };
        }
        function os(t) {
            return {
                disconnect: w([ window, window.visualViewport ], "resize", t)
            };
        }
        function rs(t, e, i) {
            return fn(MutationObserver, t, e, i);
        }
        function fn(t, e, i, s) {
            const n = new t(i);
            for (const o of E(e)) n.observe(o, s);
            return n;
        }
        function as(t) {
            hs(t) && cs(t, {
                func: "playVideo",
                method: "play"
            }), ls(t) && t.play().catch(A);
        }
        function $i(t) {
            hs(t) && cs(t, {
                func: "pauseVideo",
                method: "pause"
            }), ls(t) && t.pause();
        }
        function pn(t) {
            hs(t) && cs(t, {
                func: "mute",
                method: "setVolume",
                value: 0
            }), ls(t) && (t.muted = !0);
        }
        function ls(t) {
            return F(t, "video");
        }
        function hs(t) {
            return F(t, "iframe") && (gn(t) || mn(t));
        }
        function gn(t) {
            return !!t.src.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/);
        }
        function mn(t) {
            return !!t.src.match(/vimeo\.com\/video\/.*/);
        }
        async function cs(t, e) {
            await Fr(t), vn(t, e);
        }
        function vn(t, e) {
            t.contentWindow.postMessage(JSON.stringify({
                event: "command",
                ...e
            }), "*");
        }
        const us = "_ukPlayer";
        let zr = 0;
        function Fr(t) {
            if (t[us]) return t[us];
            const e = gn(t), i = mn(t), s = ++zr;
            let n;
            return t[us] = new Promise(o => {
                e && z(t, "load", () => {
                    const r = () => vn(t, {
                        event: "listening",
                        id: s
                    });
                    n = setInterval(r, 100), r();
                }), z(window, "message", o, !1, ({data: r}) => {
                    try {
                        return r = JSON.parse(r), e && (r == null ? void 0 : r.id) === s && r.event === "onReady" || i && Number(r == null ? void 0 : r.player_id) === s;
                    } catch {}
                }), t.src = `${t.src}${v(t.src, "?") ? "&" : "?"}${e ? "enablejsapi=1" : `api=1&player_id=${s}`}`;
            }).then(() => clearInterval(n));
        }
        function Hr(t, e = 0, i = 0) {
            return q(t) ? ri(...Jt(t).map(s => {
                const {top: n, left: o, bottom: r, right: a} = at(s);
                return {
                    top: n - e,
                    left: o - i,
                    bottom: r + e,
                    right: a + i
                };
            }).concat(T(t))) : !1;
        }
        function bn(t, {offset: e = 0} = {}) {
            const i = q(t) ? Xt(t, !1, [ "hidden" ]) : [];
            return i.reduce((r, a, l) => {
                const {scrollTop: c, scrollHeight: u, offsetHeight: d} = a, f = at(a), p = u - f.height, {height: b, top: y} = i[l - 1] ? at(i[l - 1]) : T(t);
                let P = Math.ceil(y - f.top - e + c);
                return e > 0 && d < b + e ? P += e : e = 0, P > p ? (e -= P - p, P = p) : P < 0 && (e -= P, 
                P = 0), () => s(a, P - c, t, p).then(r);
            }, () => Promise.resolve())();
            function s(r, a, l, c) {
                return new Promise(u => {
                    const d = r.scrollTop, f = n(Math.abs(a)), p = Date.now(), b = ps(r) === r, y = T(l).top + (b ? 0 : d);
                    let P = 0, it = 15;
                    (function Tt() {
                        const zt = o(K((Date.now() - p) / f));
                        let bt = 0;
                        i[0] === r && d + a < c && (bt = T(l).top + (b ? 0 : r.scrollTop) - y - g(ds(l)).height), 
                        h(r, "scrollBehavior") !== "auto" && h(r, "scrollBehavior", "auto"), r.scrollTop = d + (a + bt) * zt, 
                        h(r, "scrollBehavior", ""), zt === 1 && (P === bt || !it--) ? u() : (P = bt, requestAnimationFrame(Tt));
                    })();
                });
            }
            function n(r) {
                return 40 * Math.pow(r, .375);
            }
            function o(r) {
                return .5 * (1 - Math.cos(Math.PI * r));
            }
        }
        function yi(t, e = 0, i = 0) {
            if (!q(t)) return 0;
            const s = Bt(t, !0), {scrollHeight: n, scrollTop: o} = s, {height: r} = at(s), a = n - r, l = je(t)[0] - je(s)[0], c = Math.max(0, l - r + e), u = Math.min(a, l + t.offsetHeight - i);
            return c < u ? K((o - c) / (u - c)) : 1;
        }
        function Xt(t, e = !1, i = []) {
            const s = ps(t);
            let n = fe(t).reverse();
            n = n.slice(n.indexOf(s) + 1);
            const o = xt(n, r => h(r, "position") === "fixed");
            return ~o && (n = n.slice(o)), [ s ].concat(n.filter(r => h(r, "overflow").split(" ").some(a => v([ "auto", "scroll", ...i ], a)) && (!e || r.scrollHeight > at(r).height))).reverse();
        }
        function Bt(...t) {
            return Xt(...t)[0];
        }
        function Jt(t) {
            return Xt(t, !1, [ "hidden", "clip" ]);
        }
        function at(t) {
            const e = Lt(t), i = ps(t), s = !Pe(t) || t.contains(i);
            if (s && e.visualViewport) {
                let {height: l, width: c, scale: u, pageTop: d, pageLeft: f} = e.visualViewport;
                return l = Math.round(l * u), c = Math.round(c * u), {
                    height: l,
                    width: c,
                    top: d,
                    left: f,
                    bottom: d + l,
                    right: f + c
                };
            }
            let n = T(s ? e : t);
            if (h(t, "display") === "inline") return n;
            const {body: o, documentElement: r} = e.document, a = s ? i === r || i.clientHeight < o.clientHeight ? i : o : t;
            for (let [l, c, u, d] of [ [ "width", "x", "left", "right" ], [ "height", "y", "top", "bottom" ] ]) {
                const f = n[l] % 1;
                n[u] += S(h(a, `border-${u}-width`)), n[l] = n[c] = a[`client${Ht(l)}`] - (f ? f < .5 ? -f : 1 - f : 0), 
                n[d] = n[l] + n[u];
            }
            return n;
        }
        function ds(t) {
            const {left: e, width: i, top: s} = g(t);
            for (const n of s ? [ 0, s ] : [ 0 ]) {
                let o;
                for (const r of Lt(t).document.elementsFromPoint(e + i / 2, n)) !r.contains(t) && !$(r, "uk-togglable-leave") && (fs(r, "fixed") && wn(fe(t).reverse().find(a => !a.contains(r) && !fs(a, "static"))) < wn(r) || fs(r, "sticky") && O(r).contains(t)) && (!o || g(o).height < g(r).height) && (o = r);
                if (o) return o;
            }
        }
        function wn(t) {
            return S(h(t, "zIndex"));
        }
        function fs(t, e) {
            return h(t, "position") === e;
        }
        function ps(t) {
            return Lt(t).document.scrollingElement;
        }
        const lt = [ [ "width", "x", "left", "right" ], [ "height", "y", "top", "bottom" ] ];
        function xn(t, e, i) {
            i = {
                attach: {
                    element: [ "left", "top" ],
                    target: [ "left", "top" ],
                    ...i.attach
                },
                offset: [ 0, 0 ],
                placement: [],
                ...i
            }, J(e) || (e = [ e, e ]), T(t, $n(t, e, i));
        }
        function $n(t, e, i) {
            const s = yn(t, e, i), {boundary: n, viewportOffset: o = 0, placement: r} = i;
            let a = s;
            for (const [l, [c, , u, d]] of Object.entries(lt)) {
                const f = Lr(t, e[l], o, n, l);
                if (ki(s, f, l)) continue;
                let p = 0;
                if (r[l] === "flip") {
                    const b = i.attach.target[l];
                    if (b === d && s[d] <= f[d] || b === u && s[u] >= f[u]) continue;
                    p = jr(t, e, i, l)[u] - s[u];
                    const y = Wr(t, e[l], o, l);
                    if (!ki(gs(s, p, l), y, l)) {
                        if (ki(s, y, l)) continue;
                        if (i.recursion) return !1;
                        const P = Rr(t, e, i);
                        if (P && ki(P, y, 1 - l)) return P;
                        continue;
                    }
                } else if (r[l] === "shift") {
                    const b = T(e[l]), {offset: y} = i;
                    p = K(K(s[u], f[u], f[d] - s[c]), b[u] - s[c] + y[l], b[d] - y[l]) - s[u];
                }
                a = gs(a, p, l);
            }
            return a;
        }
        function yn(t, e, i) {
            let {attach: s, offset: n} = {
                attach: {
                    element: [ "left", "top" ],
                    target: [ "left", "top" ],
                    ...i.attach
                },
                offset: [ 0, 0 ],
                ...i
            }, o = T(t);
            for (const [r, [a, , l, c]] of Object.entries(lt)) {
                const u = s.target[r] === s.element[r] ? at(e[r]) : T(e[r]);
                o = gs(o, u[l] - o[l] + kn(s.target[r], c, u[a]) - kn(s.element[r], c, o[a]) + +n[r], r);
            }
            return o;
        }
        function gs(t, e, i) {
            const [, s, n, o] = lt[i], r = {
                ...t
            };
            return r[n] = t[s] = t[n] + e, r[o] += e, r;
        }
        function kn(t, e, i) {
            return t === "center" ? i / 2 : t === e ? i : 0;
        }
        function Lr(t, e, i, s, n) {
            let o = In(...Sn(t, e).map(at));
            return i && (o[lt[n][2]] += i, o[lt[n][3]] -= i), s && (o = In(o, T(J(s) ? s[n] : s))), 
            o;
        }
        function Wr(t, e, i, s) {
            const [n, o, r, a] = lt[s], [l] = Sn(t, e), c = at(l);
            return [ "auto", "scroll" ].includes(h(l, `overflow-${o}`)) && (c[r] -= l[`scroll${Ht(r)}`], 
            c[a] = c[r] + l[`scroll${Ht(n)}`]), c[r] += i, c[a] -= i, c;
        }
        function Sn(t, e) {
            return Jt(e).filter(i => i.contains(t));
        }
        function In(...t) {
            let e = {};
            for (const i of t) for (const [, , s, n] of lt) e[s] = Math.max(e[s] || 0, i[s]), 
            e[n] = Math.min(...[ e[n], i[n] ].filter(Boolean));
            return e;
        }
        function ki(t, e, i) {
            const [, , s, n] = lt[i];
            return t[s] >= e[s] && t[n] <= e[n];
        }
        function jr(t, e, {offset: i, attach: s}, n) {
            return yn(t, e, {
                attach: {
                    element: En(s.element, n),
                    target: En(s.target, n)
                },
                offset: qr(i, n)
            });
        }
        function Rr(t, e, i) {
            return $n(t, e, {
                ...i,
                attach: {
                    element: i.attach.element.map(Tn).reverse(),
                    target: i.attach.target.map(Tn).reverse()
                },
                offset: i.offset.reverse(),
                placement: i.placement.reverse(),
                recursion: !0
            });
        }
        function En(t, e) {
            const i = [ ...t ], s = lt[e].indexOf(t[e]);
            return ~s && (i[e] = lt[e][1 - s % 2 + 2]), i;
        }
        function Tn(t) {
            for (let e = 0; e < lt.length; e++) {
                const i = lt[e].indexOf(t);
                if (~i) return lt[1 - e][i % 2 + 2];
            }
        }
        function qr(t, e) {
            return t = [ ...t ], t[e] *= -1, t;
        }
        var Ur = Object.freeze({
            __proto__: null,
            $: x,
            $$: D,
            Animation: Ot,
            Dimensions: Ui,
            MouseTracker: un,
            Transition: M,
            addClass: I,
            after: gi,
            append: W,
            apply: Mt,
            assign: ft,
            attr: k,
            before: pi,
            boxModelAdjust: ge,
            camelize: Ee,
            children: N,
            clamp: K,
            createEvent: pe,
            css: h,
            data: Z,
            dimensions: g,
            each: he,
            empty: nn,
            endsWith: oe,
            escape: Xi,
            fastdom: Dt,
            filter: Ne,
            find: Yi,
            findAll: Fe,
            findIndex: xt,
            flipPosition: bi,
            fragment: It,
            getCoveringElement: ds,
            getEventPos: kt,
            getIndex: rt,
            getTargetedElement: ui,
            hasAttr: Pt,
            hasClass: $,
            hasOwn: gt,
            hasTouch: ce,
            height: tt,
            html: vt,
            hyphenate: Ft,
            inBrowser: qt,
            includes: v,
            index: yt,
            intersectRect: ri,
            isArray: J,
            isBoolean: le,
            isDocument: Ce,
            isElement: ae,
            isEmpty: ni,
            isEqual: Ae,
            isFocusable: Be,
            isFunction: ot,
            isInView: Hr,
            isInput: ci,
            isNode: Pe,
            isNumber: _e,
            isNumeric: mt,
            isObject: Ct,
            isPlainObject: Te,
            isRtl: U,
            isSameSiteAnchor: Vt,
            isString: H,
            isTag: F,
            isTouch: pt,
            isUndefined: X,
            isVisible: q,
            isVoidElement: Vi,
            isWindow: si,
            last: Wt,
            matches: C,
            memoize: ct,
            mute: pn,
            noop: A,
            observeIntersection: dn,
            observeMutation: rs,
            observeResize: qe,
            observeViewportResize: os,
            off: Yt,
            offset: T,
            offsetPosition: je,
            offsetViewport: at,
            on: w,
            once: z,
            overflowParents: Jt,
            parent: O,
            parents: fe,
            pause: $i,
            pick: oi,
            play: as,
            pointInRect: ai,
            pointerCancel: hi,
            pointerDown: ut,
            pointerEnter: At,
            pointerLeave: Ut,
            pointerMove: Me,
            pointerUp: _t,
            position: is,
            positionAt: xn,
            prepend: Sr,
            propName: di,
            query: et,
            queryAll: ze,
            ready: kr,
            remove: Q,
            removeAttr: Oe,
            removeClass: _,
            replaceClass: li,
            resetProps: St,
            scrollIntoView: bn,
            scrollParent: Bt,
            scrollParents: Xt,
            scrolledOver: yi,
            selFocusable: de,
            selInput: De,
            sortBy: Vs,
            startsWith: wt,
            sumBy: jt,
            swap: Ri,
            toArray: re,
            toBoolean: ji,
            toEventTargets: Ki,
            toFloat: S,
            toNode: R,
            toNodes: E,
            toNumber: $t,
            toPx: G,
            toWindow: Lt,
            toggleClass: L,
            trigger: m,
            ucfirst: Ht,
            uniqueBy: Ys,
            unwrap: We,
            width: vi,
            wrapAll: Le,
            wrapInner: es
        }), st = {
            connected() {
                I(this.$el, this.$options.id);
            }
        };
        const Vr = [ "days", "hours", "minutes", "seconds" ];
        var Yr = {
            mixins: [ st ],
            props: {
                date: String,
                clsWrapper: String,
                role: String,
                reload: Boolean
            },
            data: {
                date: "",
                clsWrapper: ".uk-countdown-%unit%",
                role: "timer",
                reload: !1
            },
            connected() {
                this.$el.role = this.role, this.date = S(Date.parse(this.$props.date)), this.started = this.end = !1, 
                this.start();
            },
            disconnected() {
                this.stop();
            },
            events: {
                name: "visibilitychange",
                el: () => document,
                handler() {
                    document.hidden ? this.stop() : this.start();
                }
            },
            methods: {
                start() {
                    this.stop(), this.update();
                },
                stop() {
                    this.timer && (clearInterval(this.timer), m(this.$el, "countdownstop"), this.timer = null);
                },
                update() {
                    const t = Gr(this.date);
                    t.total ? this.timer || (this.started = !0, this.timer = setInterval(this.update, 1e3), 
                    m(this.$el, "countdownstart")) : (this.stop(), this.end || (m(this.$el, "countdownend"), 
                    this.end = !0, this.reload && this.started && window.location.reload()));
                    for (const e of Vr) {
                        const i = x(this.clsWrapper.replace("%unit%", e), this.$el);
                        if (!i) continue;
                        let s = Math.trunc(t[e]).toString().padStart(2, "0");
                        i.textContent !== s && (s = s.split(""), s.length !== i.children.length && vt(i, s.map(() => "<span></span>").join("")), 
                        s.forEach((n, o) => i.children[o].textContent = n));
                    }
                }
            }
        };
        function Gr(t) {
            const e = Math.max(0, t - Date.now()) / 1e3;
            return {
                total: e,
                seconds: e % 60,
                minutes: e / 60 % 60,
                hours: e / 60 / 60 % 24,
                days: e / 60 / 60 / 24
            };
        }
        const V = {};
        V.events = V.watch = V.observe = V.created = V.beforeConnect = V.connected = V.beforeDisconnect = V.disconnected = V.destroy = ms, 
        V.args = function(t, e) {
            return e !== !1 && ms(e || t);
        }, V.update = function(t, e) {
            return Vs(ms(t, ot(e) ? {
                read: e
            } : e), "order");
        }, V.props = function(t, e) {
            if (J(e)) {
                const i = {};
                for (const s of e) i[s] = String;
                e = i;
            }
            return V.methods(t, e);
        }, V.computed = V.methods = function(t, e) {
            return e ? t ? {
                ...t,
                ...e
            } : e : t;
        }, V.i18n = V.data = function(t, e, i) {
            return i ? Cn(t, e, i) : e ? t ? function(s) {
                return Cn(t, e, s);
            } : e : t;
        };
        function Cn(t, e, i) {
            return V.computed(ot(t) ? t.call(i, i) : t, ot(e) ? e.call(i, i) : e);
        }
        function ms(t, e) {
            return t = t && !J(t) ? [ t ] : t, e ? t ? t.concat(e) : J(e) ? e : [ e ] : t;
        }
        function Xr(t, e) {
            return X(e) ? t : e;
        }
        function Ue(t, e, i) {
            const s = {};
            if (ot(e) && (e = e.options), e.extends && (t = Ue(t, e.extends, i)), e.mixins) for (const o of e.mixins) t = Ue(t, o, i);
            for (const o in t) n(o);
            for (const o in e) gt(t, o) || n(o);
            function n(o) {
                s[o] = (V[o] || Xr)(t[o], e[o], i);
            }
            return s;
        }
        function ve(t, e = []) {
            try {
                return t ? wt(t, "{") ? JSON.parse(t) : e.length && !v(t, ":") ? {
                    [e[0]]: t
                } : t.split(";").reduce((i, s) => {
                    const [n, o] = s.split(/:(.*)/);
                    return n && !X(o) && (i[n.trim()] = o.trim()), i;
                }, {}) : {};
            } catch {
                return {};
            }
        }
        function vs(t, e) {
            return t === Boolean ? ji(e) : t === Number ? $t(e) : t === "list" ? Kr(e) : t === Object && H(e) ? ve(e) : t ? t(e) : e;
        }
        const Jr = /,(?![^(]*\))/;
        function Kr(t) {
            return J(t) ? t : H(t) ? t.split(Jr).map(e => mt(e) ? $t(e) : ji(e.trim())) : [ t ];
        }
        function Zr(t) {
            t._data = {}, t._updates = [ ...t.$options.update || [] ], t._disconnect.push(() => t._updates = t._data = null);
        }
        function Qr(t, e) {
            t._updates.unshift(e);
        }
        function Ve(t, e = "update") {
            t._connected && t._updates.length && (t._queued || (t._queued = new Set, Dt.read(() => {
                t._connected && ta(t, t._queued), t._queued = null;
            })), t._queued.add(e.type || e));
        }
        function ta(t, e) {
            for (const {read: i, write: s, events: n = []} of t._updates) {
                if (!e.has("update") && !n.some(r => e.has(r))) continue;
                let o;
                i && (o = i.call(t, t._data, e), o && Te(o) && ft(t._data, o)), s && o !== !1 && Dt.write(() => {
                    t._connected && s.call(t, t._data, e);
                });
            }
        }
        function dt(t) {
            return Ge(qe, t, "resize");
        }
        function be(t) {
            return Ge(dn, t);
        }
        function Si(t) {
            return Ge(rs, t);
        }
        function Ii(t = {}) {
            return be({
                handler: function(e, i) {
                    const {targets: s = this.$el, preload: n = 5} = t;
                    for (const o of E(ot(s) ? s(this) : s)) D('[loading="lazy"]', o).slice(0, n - 1).forEach(r => Oe(r, "loading"));
                    for (const o of e.filter(({isIntersecting: r}) => r).map(({target: r}) => r)) i.unobserve(o);
                },
                ...t
            });
        }
        function bs(t) {
            return Ge((e, i) => os(i), t, "resize");
        }
        function Ye(t) {
            return Ge((e, i) => ({
                disconnect: w(ia(e), "scroll", i, {
                    passive: !0
                })
            }), t, "scroll");
        }
        function Pn(t) {
            return {
                observe(e, i) {
                    return {
                        observe: A,
                        unobserve: A,
                        disconnect: w(e, ut, i, {
                            passive: !0
                        })
                    };
                },
                handler(e) {
                    if (!pt(e)) return;
                    const i = kt(e), s = "tagName" in e.target ? e.target : O(e.target);
                    z(document, `${_t} ${hi} scroll`, n => {
                        const {x: o, y: r} = kt(n);
                        (n.type !== "scroll" && s && o && Math.abs(i.x - o) > 100 || r && Math.abs(i.y - r) > 100) && setTimeout(() => {
                            m(s, "swipe"), m(s, `swipe${ea(i.x, i.y, o, r)}`);
                        });
                    });
                },
                ...t
            };
        }
        function Ge(t, e, i) {
            return {
                observe: t,
                handler() {
                    Ve(this, i);
                },
                ...e
            };
        }
        function ea(t, e, i, s) {
            return Math.abs(t - i) >= Math.abs(e - s) ? t - i > 0 ? "Left" : "Right" : e - s > 0 ? "Up" : "Down";
        }
        function ia(t) {
            return E(t).map(e => {
                const {ownerDocument: i} = e, s = Bt(e, !0);
                return s === i.scrollingElement ? i : s;
            });
        }
        var _n = {
            props: {
                margin: String,
                firstColumn: Boolean
            },
            data: {
                margin: "uk-margin-small-top",
                firstColumn: "uk-first-column"
            },
            observe: [ Si({
                options: {
                    childList: !0
                }
            }), Si({
                options: {
                    attributes: !0,
                    attributeFilter: [ "style" ]
                }
            }), dt({
                handler(t) {
                    for (const {borderBoxSize: [{inlineSize: e, blockSize: i}]} of t) if (e || i) {
                        this.$emit("resize");
                        return;
                    }
                },
                target: ({$el: t}) => [ t, ...N(t) ]
            }) ],
            update: {
                read() {
                    return {
                        rows: ws(N(this.$el))
                    };
                },
                write({rows: t}) {
                    for (const e of t) for (const i of e) L(i, this.margin, t[0] !== e), L(i, this.firstColumn, e[U ? e.length - 1 : 0] === i);
                },
                events: [ "resize" ]
            }
        };
        function ws(t) {
            const e = [ [] ], i = t.some((s, n) => n && t[n - 1].offsetParent !== s.offsetParent);
            for (const s of t) {
                if (!q(s)) continue;
                const n = xs(s, i);
                for (let o = e.length - 1; o >= 0; o--) {
                    const r = e[o];
                    if (!r[0]) {
                        r.push(s);
                        break;
                    }
                    const a = xs(r[0], i);
                    if (n.top >= a.bottom - 1 && n.top !== a.top) {
                        e.push([ s ]);
                        break;
                    }
                    if (n.bottom - 1 > a.top || n.top === a.top) {
                        let l = r.length - 1;
                        for (;l >= 0; l--) {
                            const c = xs(r[l], i);
                            if (n.left >= c.left) break;
                        }
                        r.splice(l + 1, 0, s);
                        break;
                    }
                    if (o === 0) {
                        e.unshift([ s ]);
                        break;
                    }
                }
            }
            return e;
        }
        function xs(t, e = !1) {
            let {offsetTop: i, offsetLeft: s, offsetHeight: n, offsetWidth: o} = t;
            return e && ([i, s] = je(t)), {
                top: i,
                left: s,
                bottom: i + n,
                right: s + o
            };
        }
        const $s = "uk-transition-leave", ys = "uk-transition-enter";
        function An(t, e, i, s = 0) {
            const n = ks(e, !0), o = {
                opacity: 1
            }, r = {
                opacity: 0
            }, a = () => n === ks(e), l = d => () => a() ? d() : Promise.reject(), c = l(async () => {
                I(e, $s), await (s ? Promise.all(Mn(e).map(async (d, f) => (await Ss(f * s), M.start(d, r, i / 2, "ease")))) : M.start(e, r, i / 2, "ease")), 
                _(e, $s);
            }), u = l(async () => {
                const d = tt(e);
                I(e, ys), t(), h(s ? N(e) : e, r), tt(e, d), await Ss(), tt(e, "");
                const f = tt(e);
                h(e, "alignContent", "flex-start"), tt(e, d);
                let p = [], b = i / 2;
                if (s) {
                    const y = Mn(e);
                    h(N(e), r), p = y.map(async (P, it) => {
                        await Ss(it * s), await M.start(P, o, i / 2, "ease"), a() && St(P, o);
                    }), b += y.length * s;
                }
                if (!s || d !== f) {
                    const y = {
                        height: f,
                        ...s ? {} : o
                    };
                    p.push(M.start(e, y, b, "ease"));
                }
                await Promise.all(p), _(e, ys), a() && (St(e, {
                    height: "",
                    alignContent: "",
                    ...o
                }), delete e.dataset.transition);
            });
            return $(e, $s) ? On(e).then(u) : $(e, ys) ? On(e).then(c).then(u) : c().then(u);
        }
        function ks(t, e) {
            return e && (t.dataset.transition = 1 + ks(t)), $t(t.dataset.transition) || 0;
        }
        function On(t) {
            return Promise.all(N(t).filter(M.inProgress).map(e => new Promise(i => z(e, "transitionend transitioncanceled", i))));
        }
        function Mn(t) {
            return ws(N(t)).flat().filter(q);
        }
        function Ss(t) {
            return new Promise(e => setTimeout(e, t));
        }
        async function sa(t, e, i) {
            await Nn();
            let s = N(e);
            const n = s.map(p => Dn(p, !0)), o = {
                ...h(e, [ "height", "padding" ]),
                display: "block"
            }, r = s.concat(e);
            await Promise.all(r.map(M.cancel)), h(r, "transitionProperty", "none"), await t(), 
            s = s.concat(N(e).filter(p => !v(s, p))), await Promise.resolve(), h(r, "transitionProperty", "");
            const a = k(e, "style"), l = h(e, [ "height", "padding" ]), [c, u] = na(e, s, n), d = s.map(p => ({
                style: k(p, "style")
            }));
            s.forEach((p, b) => u[b] && h(p, u[b])), h(e, o), m(e, "scroll"), await Nn();
            const f = s.map((p, b) => O(p) === e && M.start(p, c[b], i, "ease")).concat(M.start(e, l, i, "ease"));
            try {
                await Promise.all(f), s.forEach((p, b) => {
                    k(p, d[b]), O(p) === e && h(p, "display", c[b].opacity === 0 ? "none" : "");
                }), k(e, "style", a);
            } catch {
                k(s, "style", ""), St(e, o);
            }
        }
        function Dn(t, e) {
            const i = h(t, "zIndex");
            return q(t) ? {
                display: "",
                opacity: e ? h(t, "opacity") : "0",
                pointerEvents: "none",
                position: "absolute",
                zIndex: i === "auto" ? yt(t) : i,
                ...Bn(t)
            } : !1;
        }
        function na(t, e, i) {
            const s = e.map((o, r) => O(o) && r in i ? i[r] ? q(o) ? Bn(o) : {
                opacity: 0
            } : {
                opacity: q(o) ? 1 : 0
            } : !1), n = s.map((o, r) => {
                const a = O(e[r]) === t && (i[r] || Dn(e[r]));
                if (!a) return !1;
                if (!o) delete a.opacity; else if (!("opacity" in o)) {
                    const {opacity: l} = a;
                    l % 1 ? o.opacity = 1 : delete a.opacity;
                }
                return a;
            });
            return [ s, n ];
        }
        function Bn(t) {
            const {height: e, width: i} = g(t);
            return {
                height: e,
                width: i,
                transform: "",
                ...is(t),
                ...h(t, [ "marginTop", "marginLeft" ])
            };
        }
        function Nn() {
            return new Promise(t => requestAnimationFrame(t));
        }
        var zn = {
            props: {
                duration: Number,
                animation: Boolean
            },
            data: {
                duration: 150,
                animation: "slide"
            },
            methods: {
                animate(t, e = this.$el) {
                    const i = this.animation;
                    return (i === "fade" ? An : i === "delayed-fade" ? (...n) => An(...n, 40) : i ? sa : () => (t(), 
                    Promise.resolve()))(t, e, this.duration).catch(A);
                }
            }
        };
        function Et(t) {
            t.target.closest('a[href="#"],a[href=""]') && t.preventDefault();
        }
        const B = {
            TAB: 9,
            ESC: 27,
            SPACE: 32,
            END: 35,
            HOME: 36,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };
        var oa = {
            mixins: [ zn ],
            args: "target",
            props: {
                target: String,
                selActive: Boolean
            },
            data: {
                target: "",
                selActive: !1,
                attrItem: "uk-filter-control",
                cls: "uk-active",
                duration: 250
            },
            computed: {
                children: ({target: t}, e) => D(`${t} > *`, e),
                toggles: ({attrItem: t}, e) => D(`[${t}],[data-${t}]`, e)
            },
            watch: {
                toggles(t) {
                    this.updateState();
                    const e = D(this.selActive, this.$el);
                    for (const i of t) {
                        this.selActive !== !1 && L(i, this.cls, v(e, i));
                        const s = ca(i);
                        F(s, "a") && (s.role = "button");
                    }
                },
                children(t, e) {
                    e && this.updateState();
                }
            },
            events: {
                name: "click keydown",
                delegate: ({attrItem: t}) => `[${t}],[data-${t}]`,
                handler(t) {
                    t.type === "keydown" && t.keyCode !== B.SPACE || t.target.closest("a,button") && (Et(t), 
                    this.apply(t.current));
                }
            },
            methods: {
                apply(t) {
                    const e = this.getState(), i = Hn(t, this.attrItem, this.getState());
                    ra(e, i) || this.setState(i);
                },
                getState() {
                    return this.toggles.filter(t => $(t, this.cls)).reduce((t, e) => Hn(e, this.attrItem, t), {
                        filter: {
                            "": ""
                        },
                        sort: []
                    });
                },
                async setState(t, e = !0) {
                    t = {
                        filter: {
                            "": ""
                        },
                        sort: [],
                        ...t
                    }, m(this.$el, "beforeFilter", [ this, t ]);
                    for (const i of this.toggles) L(i, this.cls, la(i, this.attrItem, t));
                    await Promise.all(D(this.target, this.$el).map(i => {
                        const s = () => aa(t, i, N(i));
                        return e ? this.animate(s, i) : s();
                    })), m(this.$el, "afterFilter", [ this ]);
                },
                updateState() {
                    Dt.write(() => this.setState(this.getState(), !1));
                }
            }
        };
        function Fn(t, e) {
            return ve(Z(t, e), [ "filter" ]);
        }
        function ra(t, e) {
            return [ "filter", "sort" ].every(i => Ae(t[i], e[i]));
        }
        function aa(t, e, i) {
            for (const o of i) h(o, "display", Object.values(t.filter).every(r => !r || C(o, r)) ? "" : "none");
            const [s, n] = t.sort;
            if (s) {
                const o = ha(i, s, n);
                Ae(o, i) || W(e, o);
            }
        }
        function Hn(t, e, i) {
            const {filter: s, group: n, sort: o, order: r = "asc"} = Fn(t, e);
            return (s || X(o)) && (n ? s ? (delete i.filter[""], i.filter[n] = s) : (delete i.filter[n], 
            (ni(i.filter) || "" in i.filter) && (i.filter = {
                "": s || ""
            })) : i.filter = {
                "": s || ""
            }), X(o) || (i.sort = [ o, r ]), i;
        }
        function la(t, e, {filter: i = {
            "": ""
        }, sort: [s, n]}) {
            const {filter: o = "", group: r = "", sort: a, order: l = "asc"} = Fn(t, e);
            return X(a) ? r in i && o === i[r] || !o && r && !(r in i) && !i[""] : s === a && n === l;
        }
        function ha(t, e, i) {
            return [ ...t ].sort((s, n) => Z(s, e).localeCompare(Z(n, e), void 0, {
                numeric: !0
            }) * (i === "asc" || -1));
        }
        function ca(t) {
            return x("a,button", t) || t;
        }
        var ua = {
            args: "dataSrc",
            props: {
                dataSrc: String,
                sources: String,
                margin: String,
                target: String,
                loading: String
            },
            data: {
                dataSrc: "",
                sources: !1,
                margin: "50%",
                target: !1,
                loading: "lazy"
            },
            connected() {
                this.loading !== "lazy" ? this.load() : Es(this.$el) && (this.$el.loading = "lazy", 
                Is(this.$el));
            },
            disconnected() {
                this.img && (this.img.onload = ""), delete this.img;
            },
            observe: be({
                handler(t, e) {
                    this.load(), e.disconnect();
                },
                options: ({margin: t}) => ({
                    rootMargin: t
                }),
                filter: ({loading: t}) => t === "lazy",
                target: ({$el: t, $props: e}) => e.target ? [ t, ...ze(e.target, t) ] : t
            }),
            methods: {
                load() {
                    if (this.img) return this.img;
                    const t = Es(this.$el) ? this.$el : fa(this.$el, this.dataSrc, this.sources);
                    return Oe(t, "loading"), Is(this.$el, t.currentSrc), this.img = t;
                }
            }
        };
        function Is(t, e) {
            if (Es(t)) {
                const i = O(t);
                (F(i, "picture") ? N(i) : [ t ]).forEach(n => Ln(n, n));
            } else e && !v(t.style.backgroundImage, e) && (h(t, "backgroundImage", `url(${Xi(e)})`), 
            m(t, pe("load", !1)));
        }
        const da = [ "data-src", "data-srcset", "sizes" ];
        function Ln(t, e) {
            for (const i of da) {
                const s = Z(t, i);
                s && k(e, i.replace(/data-/g, ""), s);
            }
        }
        function fa(t, e, i) {
            const s = new Image;
            return Wn(s, i), Ln(t, s), s.onload = () => Is(t, s.currentSrc), s.src = e, s;
        }
        function Wn(t, e) {
            if (e = pa(e), e.length) {
                const i = It("<picture>");
                for (const s of e) {
                    const n = It("<source>");
                    k(n, s), W(i, n);
                }
                W(i, t);
            }
        }
        function pa(t) {
            if (!t) return [];
            if (wt(t, "[")) try {
                t = JSON.parse(t);
            } catch {
                t = [];
            } else t = ve(t);
            return J(t) || (t = [ t ]), t.filter(e => !ni(e));
        }
        function Es(t) {
            return F(t, "img");
        }
        let Ts;
        function jn(t) {
            const e = w(t, "touchstart", n => {
                if (n.targetTouches.length !== 1 || C(n.target, 'input[type="range"')) return;
                let o = kt(n).y;
                const r = w(t, "touchmove", a => {
                    const l = kt(a).y;
                    l !== o && (o = l, Xt(a.target).some(c => {
                        if (!t.contains(c)) return !1;
                        let {scrollHeight: u, clientHeight: d} = c;
                        return d < u;
                    }) || a.preventDefault());
                }, {
                    passive: !1
                });
                z(t, "scroll touchend touchcanel", r, {
                    capture: !0
                });
            }, {
                passive: !0
            });
            if (Ts) return e;
            Ts = !0;
            const {scrollingElement: i} = document, s = {
                overflowY: CSS.supports("overflow", "clip") ? "clip" : "hidden",
                touchAction: "none",
                paddingRight: vi(window) - i.clientWidth || ""
            };
            return h(i, s), () => {
                Ts = !1, e(), St(i, s);
            };
        }
        var Xe = {
            props: {
                container: Boolean
            },
            data: {
                container: !0
            },
            computed: {
                container({container: t}) {
                    return t === !0 && this.$container || t && x(t);
                }
            }
        }, Rn = {
            props: {
                pos: String,
                offset: Boolean,
                flip: Boolean,
                shift: Boolean,
                inset: Boolean
            },
            data: {
                pos: `bottom-${U ? "right" : "left"}`,
                offset: !1,
                flip: !0,
                shift: !0,
                inset: !1
            },
            connected() {
                this.pos = this.$props.pos.split("-").concat("center").slice(0, 2), [this.dir, this.align] = this.pos, 
                this.axis = v([ "top", "bottom" ], this.dir) ? "y" : "x";
            },
            methods: {
                positionAt(t, e, i) {
                    let s = [ this.getPositionOffset(t), this.getShiftOffset(t) ];
                    const n = [ this.flip && "flip", this.shift && "shift" ], o = {
                        element: [ this.inset ? this.dir : bi(this.dir), this.align ],
                        target: [ this.dir, this.align ]
                    };
                    if (this.axis === "y") {
                        for (const l in o) o[l].reverse();
                        s.reverse(), n.reverse();
                    }
                    const r = Cs(t), a = g(t);
                    h(t, {
                        top: -a.height,
                        left: -a.width
                    }), xn(t, e, {
                        attach: o,
                        offset: s,
                        boundary: i,
                        placement: n,
                        viewportOffset: this.getViewportOffset(t)
                    }), r();
                },
                getPositionOffset(t = this.$el) {
                    return G(this.offset === !1 ? h(t, "--uk-position-offset") : this.offset, this.axis === "x" ? "width" : "height", t) * (v([ "left", "top" ], this.dir) ? -1 : 1) * (this.inset ? -1 : 1);
                },
                getShiftOffset(t = this.$el) {
                    return this.align === "center" ? 0 : G(h(t, "--uk-position-shift-offset"), this.axis === "y" ? "width" : "height", t) * (v([ "left", "top" ], this.align) ? 1 : -1);
                },
                getViewportOffset(t) {
                    return G(h(t, "--uk-position-viewport-offset"));
                }
            }
        };
        function Cs(t) {
            const e = Bt(t), {scrollTop: i} = e;
            return () => {
                i !== e.scrollTop && (e.scrollTop = i);
            };
        }
        var Kt = {
            props: {
                cls: Boolean,
                animation: "list",
                duration: Number,
                velocity: Number,
                origin: String,
                transition: String
            },
            data: {
                cls: !1,
                animation: [ !1 ],
                duration: 200,
                velocity: .2,
                origin: !1,
                transition: "ease",
                clsEnter: "uk-togglable-enter",
                clsLeave: "uk-togglable-leave"
            },
            computed: {
                hasAnimation: ({animation: t}) => !!t[0],
                hasTransition: ({animation: t}) => [ "slide", "reveal" ].some(e => wt(t[0], e))
            },
            methods: {
                async toggleElement(t, e, i) {
                    try {
                        return await Promise.all(E(t).map(s => {
                            const n = le(e) ? e : !this.isToggled(s);
                            if (!m(s, `before${n ? "show" : "hide"}`, [ this ])) return Promise.reject();
                            const o = (ot(i) ? i : i === !1 || !this.hasAnimation ? ga : this.hasTransition ? ma : va)(s, n, this), r = n ? this.clsEnter : this.clsLeave;
                            I(s, r), m(s, n ? "show" : "hide", [ this ]);
                            const a = () => {
                                var l;
                                if (_(s, r), m(s, n ? "shown" : "hidden", [ this ]), n) {
                                    const c = Cs(s);
                                    (l = D("[autofocus]", s).find(q)) == null || l.focus(), c();
                                }
                            };
                            return o ? o.then(a, () => (_(s, r), Promise.reject())) : a();
                        })), !0;
                    } catch {
                        return !1;
                    }
                },
                isToggled(t = this.$el) {
                    return t = R(t), $(t, this.clsEnter) ? !0 : $(t, this.clsLeave) ? !1 : this.cls ? $(t, this.cls.split(" ")[0]) : q(t);
                },
                _toggle(t, e) {
                    if (!t) return;
                    e = !!e;
                    let i;
                    this.cls ? (i = v(this.cls, " ") || e !== $(t, this.cls), i && L(t, this.cls, v(this.cls, " ") ? void 0 : e)) : (i = e === t.hidden, 
                    i && (t.hidden = !e)), i && m(t, "toggled", [ e, this ]);
                }
            }
        };
        function ga(t, e, {_toggle: i}) {
            return Ot.cancel(t), M.cancel(t), i(t, e);
        }
        async function ma(t, e, {animation: i, duration: s, velocity: n, transition: o, _toggle: r}) {
            var a;
            const [l = "reveal", c = "top"] = ((a = i[0]) == null ? void 0 : a.split("-")) || [], u = [ [ "left", "right" ], [ "top", "bottom" ] ], d = u[v(u[0], c) ? 0 : 1], f = d[1] === c, b = [ "width", "height" ][u.indexOf(d)], y = `margin-${d[0]}`, P = `margin-${c}`;
            let it = g(t)[b];
            const Tt = M.inProgress(t);
            await M.cancel(t), e && r(t, !0);
            const zt = Object.fromEntries([ "padding", "border", "width", "height", "minWidth", "minHeight", "overflowY", "overflowX", y, P ].map(ar => [ ar, t.style[ar] ])), bt = g(t), Us = S(h(t, y)), nr = S(h(t, P)), ne = bt[b] + nr;
            !Tt && !e && (it += nr);
            const [Li] = es(t, "<div>");
            h(Li, {
                boxSizing: "border-box",
                height: bt.height,
                width: bt.width,
                ...h(t, [ "overflow", "padding", "borderTop", "borderRight", "borderBottom", "borderLeft", "borderImage", P ])
            }), h(t, {
                padding: 0,
                border: 0,
                minWidth: 0,
                minHeight: 0,
                [P]: 0,
                width: bt.width,
                height: bt.height,
                overflow: "hidden",
                [b]: it
            });
            const or = it / ne;
            s = (n * ne + s) * (e ? 1 - or : or);
            const rr = {
                [b]: e ? ne : 0
            };
            f && (h(t, y, ne - it + Us), rr[y] = e ? Us : ne + Us), !f ^ l === "reveal" && (h(Li, y, -ne + it), 
            M.start(Li, {
                [y]: e ? 0 : -ne
            }, s, o));
            try {
                await M.start(t, rr, s, o);
            } finally {
                h(t, zt), We(Li.firstChild), e || r(t, !1);
            }
        }
        function va(t, e, i) {
            const {animation: s, duration: n, _toggle: o} = i;
            return e ? (o(t, !0), Ot.in(t, s[0], n, i.origin)) : Ot.out(t, s[1] || s[0], n, i.origin).then(() => o(t, !1));
        }
        const nt = [];
        var Ps = {
            mixins: [ st, Xe, Kt ],
            props: {
                selPanel: String,
                selClose: String,
                escClose: Boolean,
                bgClose: Boolean,
                stack: Boolean,
                role: String
            },
            data: {
                cls: "uk-open",
                escClose: !0,
                bgClose: !0,
                overlay: !0,
                stack: !1,
                role: "dialog"
            },
            computed: {
                panel: ({selPanel: t}, e) => x(t, e),
                transitionElement() {
                    return this.panel;
                }
            },
            connected() {
                const t = this.panel || this.$el;
                t.role = this.role, this.overlay && (t.ariaModal = !0);
            },
            beforeDisconnect() {
                v(nt, this) && this.toggleElement(this.$el, !1, !1);
            },
            events: [ {
                name: "click",
                delegate: ({selClose: t}) => `${t},a[href*="#"]`,
                handler(t) {
                    const {current: e, defaultPrevented: i} = t, {hash: s} = e;
                    !i && s && Vt(e) && !this.$el.contains(x(s)) ? this.hide() : C(e, this.selClose) && (Et(t), 
                    this.hide());
                }
            }, {
                name: "toggle",
                self: !0,
                handler(t, e) {
                    t.defaultPrevented || (t.preventDefault(), this.target = e == null ? void 0 : e.$el, 
                    this.isToggled() === v(nt, this) && this.toggle());
                }
            }, {
                name: "beforeshow",
                self: !0,
                handler(t) {
                    if (v(nt, this)) return !1;
                    !this.stack && nt.length ? (Promise.all(nt.map(e => e.hide())).then(this.show), 
                    t.preventDefault()) : nt.push(this);
                }
            }, {
                name: "show",
                self: !0,
                handler() {
                    this.stack && h(this.$el, "zIndex", S(h(this.$el, "zIndex")) + nt.length);
                    const t = [ this.overlay && wa(this), this.overlay && jn(this.$el), this.bgClose && xa(this), this.escClose && $a(this) ];
                    z(this.$el, "hidden", () => t.forEach(e => e && e()), {
                        self: !0
                    }), I(document.documentElement, this.clsPage), Un(this.target, !0);
                }
            }, {
                name: "shown",
                self: !0,
                handler() {
                    Be(this.$el) || (this.$el.tabIndex = -1), C(this.$el, ":focus-within") || this.$el.focus();
                }
            }, {
                name: "hidden",
                self: !0,
                handler() {
                    v(nt, this) && nt.splice(nt.indexOf(this), 1), h(this.$el, "zIndex", "");
                    const {target: t} = this;
                    nt.some(e => e.clsPage === this.clsPage) || (_(document.documentElement, this.clsPage), 
                    queueMicrotask(() => Be(t) && t.focus())), Un(t, !1), this.target = null;
                }
            } ],
            methods: {
                toggle() {
                    return this.isToggled() ? this.hide() : this.show();
                },
                show() {
                    return this.container && O(this.$el) !== this.container ? (W(this.container, this.$el), 
                    new Promise(t => requestAnimationFrame(() => this.show().then(t)))) : this.toggleElement(this.$el, !0, qn);
                },
                hide() {
                    return this.toggleElement(this.$el, !1, qn);
                }
            }
        };
        function qn(t, e, {transitionElement: i, _toggle: s}) {
            return new Promise((n, o) => z(t, "show hide", () => {
                var r;
                (r = t._reject) == null || r.call(t), t._reject = o, s(t, e);
                const a = z(i, "transitionstart", () => {
                    z(i, "transitionend transitioncancel", n, {
                        self: !0
                    }), clearTimeout(l);
                }, {
                    self: !0
                }), l = setTimeout(() => {
                    a(), n();
                }, ba(h(i, "transitionDuration")));
            })).then(() => delete t._reject);
        }
        function ba(t) {
            return t ? oe(t, "ms") ? S(t) : S(t) * 1e3 : 0;
        }
        function wa(t) {
            return w(document, "focusin", e => {
                Wt(nt) === t && !t.$el.contains(e.target) && t.$el.focus();
            });
        }
        function xa(t) {
            return w(document, ut, ({target: e}) => {
                Wt(nt) !== t || t.overlay && !t.$el.contains(e) || !t.panel || t.panel.contains(e) || z(document, `${_t} ${hi} scroll`, ({defaultPrevented: i, type: s, target: n}) => {
                    !i && s === _t && e === n && t.hide();
                }, !0);
            });
        }
        function $a(t) {
            return w(document, "keydown", e => {
                e.keyCode === 27 && Wt(nt) === t && t.hide();
            });
        }
        function Un(t, e) {
            t != null && t.ariaExpanded && (t.ariaExpanded = e);
        }
        var _s = {
            slide: {
                show(t) {
                    return [ {
                        transform: j(t * -100)
                    }, {
                        transform: j()
                    } ];
                },
                percent(t) {
                    return Je(t);
                },
                translate(t, e) {
                    return [ {
                        transform: j(e * -100 * t)
                    }, {
                        transform: j(e * 100 * (1 - t))
                    } ];
                }
            }
        };
        function Je(t) {
            return Math.abs(new DOMMatrix(h(t, "transform")).m41 / t.offsetWidth);
        }
        function j(t = 0, e = "%") {
            return t ? `translate3d(${t + e}, 0, 0)` : "";
        }
        function ya(t, e, i, {animation: s, easing: n}) {
            const {percent: o, translate: r, show: a = A} = s, l = a(i), {promise: c, resolve: u} = Vn();
            return {
                dir: i,
                show(d, f = 0, p) {
                    const b = p ? "linear" : n;
                    return d -= Math.round(d * K(f, -1, 1)), this.translate(f), Zt(e, "itemin", {
                        percent: f,
                        duration: d,
                        timing: b,
                        dir: i
                    }), Zt(t, "itemout", {
                        percent: 1 - f,
                        duration: d,
                        timing: b,
                        dir: i
                    }), Promise.all([ M.start(e, l[1], d, b), M.start(t, l[0], d, b) ]).then(() => {
                        this.reset(), u();
                    }, A), c;
                },
                cancel() {
                    return M.cancel([ e, t ]);
                },
                reset() {
                    St([ e, t ], l[0]);
                },
                async forward(d, f = this.percent()) {
                    return await this.cancel(), this.show(d, f, !0);
                },
                translate(d) {
                    this.reset();
                    const f = r(d, i);
                    h(e, f[1]), h(t, f[0]), Zt(e, "itemtranslatein", {
                        percent: d,
                        dir: i
                    }), Zt(t, "itemtranslateout", {
                        percent: 1 - d,
                        dir: i
                    });
                },
                percent() {
                    return o(t || e, e, i);
                },
                getDistance() {
                    return t == null ? void 0 : t.offsetWidth;
                }
            };
        }
        function Zt(t, e, i) {
            m(t, pe(e, !1, !1, i));
        }
        function Vn() {
            let t;
            return {
                promise: new Promise(e => t = e),
                resolve: t
            };
        }
        var Ei = {
            props: {
                i18n: Object
            },
            data: {
                i18n: null
            },
            methods: {
                t(t, ...e) {
                    var i, s, n;
                    let o = 0;
                    return ((n = ((i = this.i18n) == null ? void 0 : i[t]) || ((s = this.$options.i18n) == null ? void 0 : s[t])) == null ? void 0 : n.replace(/%s/g, () => e[o++] || "")) || "";
                }
            }
        }, ka = {
            props: {
                autoplay: Boolean,
                autoplayInterval: Number,
                pauseOnHover: Boolean
            },
            data: {
                autoplay: !1,
                autoplayInterval: 7e3,
                pauseOnHover: !0
            },
            connected() {
                k(this.list, "aria-live", this.autoplay ? "off" : "polite"), this.autoplay && this.startAutoplay();
            },
            disconnected() {
                this.stopAutoplay();
            },
            update() {
                k(this.slides, "tabindex", "-1");
            },
            events: [ {
                name: "visibilitychange",
                el: () => document,
                filter: ({autoplay: t}) => t,
                handler() {
                    document.hidden ? this.stopAutoplay() : this.startAutoplay();
                }
            } ],
            methods: {
                startAutoplay() {
                    this.stopAutoplay(), this.interval = setInterval(() => {
                        this.stack.length || this.draggable && C(this.$el, ":focus-within") && !C(this.$el, ":focus") || this.pauseOnHover && C(this.$el, ":hover") || this.show("next");
                    }, this.autoplayInterval);
                },
                stopAutoplay() {
                    clearInterval(this.interval);
                }
            }
        };
        const Ti = {
            passive: !1,
            capture: !0
        }, Yn = {
            passive: !0,
            capture: !0
        }, Sa = "touchstart mousedown", As = "touchmove mousemove", Gn = "touchend touchcancel mouseup click input scroll";
        var Ia = {
            props: {
                draggable: Boolean
            },
            data: {
                draggable: !0,
                threshold: 10
            },
            created() {
                for (const t of [ "start", "move", "end" ]) {
                    const e = this[t];
                    this[t] = i => {
                        const s = kt(i).x * (U ? -1 : 1);
                        this.prevPos = s === this.pos ? this.prevPos : this.pos, this.pos = s, e(i);
                    };
                }
            },
            events: [ {
                name: Sa,
                passive: !0,
                delegate: ({selList: t}) => `${t} > *`,
                handler(t) {
                    !this.draggable || this.parallax || !pt(t) && Ea(t.target) || t.target.closest(De) || t.button > 0 || this.length < 2 || this.start(t);
                }
            }, {
                name: "dragstart",
                handler(t) {
                    t.preventDefault();
                }
            }, {
                name: As,
                el: ({list: t}) => t,
                handler: A,
                ...Ti
            } ],
            methods: {
                start() {
                    this.drag = this.pos, this._transitioner ? (this.percent = this._transitioner.percent(), 
                    this.drag += this._transitioner.getDistance() * this.percent * this.dir, this._transitioner.cancel(), 
                    this._transitioner.translate(this.percent), this.dragging = !0, this.stack = []) : this.prevIndex = this.index, 
                    w(document, As, this.move, Ti), w(document, Gn, this.end, Yn), h(this.list, "userSelect", "none");
                },
                move(t) {
                    const e = this.pos - this.drag;
                    if (e === 0 || this.prevPos === this.pos || !this.dragging && Math.abs(e) < this.threshold) return;
                    t.cancelable && t.preventDefault(), this.dragging = !0, this.dir = e < 0 ? 1 : -1;
                    let {slides: i, prevIndex: s} = this, n = Math.abs(e), o = this.getIndex(s + this.dir), r = Xn.call(this, s, o);
                    for (;o !== s && n > r; ) this.drag -= r * this.dir, s = o, n -= r, o = this.getIndex(s + this.dir), 
                    r = Xn.call(this, s, o);
                    this.percent = n / r;
                    const a = i[s], l = i[o], c = this.index !== o, u = s === o;
                    let d;
                    for (const f of [ this.index, this.prevIndex ]) v([ o, s ], f) || (m(i[f], "itemhidden", [ this ]), 
                    u && (d = !0, this.prevIndex = s));
                    (this.index === s && this.prevIndex !== s || d) && m(i[this.index], "itemshown", [ this ]), 
                    c && (this.prevIndex = s, this.index = o, u || (m(a, "beforeitemhide", [ this ]), 
                    m(a, "itemhide", [ this ])), m(l, "beforeitemshow", [ this ]), m(l, "itemshow", [ this ])), 
                    this._transitioner = this._translate(Math.abs(this.percent), a, !u && l);
                },
                end() {
                    if (Yt(document, As, this.move, Ti), Yt(document, Gn, this.end, Yn), this.dragging) if (setTimeout(w(this.list, "click", t => t.preventDefault(), Ti)), 
                    this.dragging = null, this.index === this.prevIndex) this.percent = 1 - this.percent, 
                    this.dir *= -1, this._show(!1, this.index, !0), this._transitioner = null; else {
                        const t = (U ? this.dir * (U ? 1 : -1) : this.dir) < 0 == this.prevPos > this.pos;
                        this.index = t ? this.index : this.prevIndex, t && (m(this.slides[this.prevIndex], "itemhidden", [ this ]), 
                        m(this.slides[this.index], "itemshown", [ this ]), this.percent = 1 - this.percent), 
                        this.show(this.dir > 0 && !t || this.dir < 0 && t ? "next" : "previous", !0);
                    }
                    h(this.list, {
                        userSelect: ""
                    }), this.drag = this.percent = null;
                }
            }
        };
        function Xn(t, e) {
            return this._getTransitioner(t, t !== e && e).getDistance() || this.slides[t].offsetWidth;
        }
        function Ea(t) {
            return h(t, "userSelect") !== "none" && re(t.childNodes).some(e => e.nodeType === 3 && e.textContent.trim());
        }
        function Ta(t) {
            t._watches = [];
            for (const e of t.$options.watch || []) for (const [i, s] of Object.entries(e)) Jn(t, s, i);
            t._initial = !0;
        }
        function Jn(t, e, i) {
            t._watches.push({
                name: i,
                ...Te(e) ? e : {
                    handler: e
                }
            });
        }
        function Ca(t, e) {
            for (const {name: i, handler: s, immediate: n = !0} of t._watches) (t._initial && n || gt(e, i) && !Ae(e[i], t[i])) && s.call(t, t[i], e[i]);
            t._initial = !1;
        }
        function Pa(t) {
            const {computed: e} = t.$options;
            if (t._computed = {}, e) for (const i in e) Zn(t, i, e[i]);
        }
        const Kn = {
            subtree: !0,
            childList: !0
        };
        function Zn(t, e, i) {
            t._hasComputed = !0, Object.defineProperty(t, e, {
                enumerable: !0,
                get() {
                    const {_computed: s, $props: n, $el: o} = t;
                    if (!gt(s, e) && (s[e] = (i.get || i).call(t, n, o), i.observe && t._computedObserver)) {
                        const r = i.observe.call(t, n);
                        t._computedObserver.observe([ "~", "+", "-" ].includes(r[0]) ? o.parentElement : o.getRootNode(), Kn);
                    }
                    return s[e];
                },
                set(s) {
                    const {_computed: n} = t;
                    n[e] = i.set ? i.set.call(t, s) : s, X(n[e]) && delete n[e];
                }
            });
        }
        function _a(t) {
            t._hasComputed && (Qr(t, {
                read: () => Ca(t, Qn(t)),
                events: [ "resize", "computed" ]
            }), t._computedObserver = rs(t.$el, () => Ve(t, "computed"), Kn), t._disconnect.push(() => {
                t._computedObserver.disconnect(), t._computedObserver = null, Qn(t);
            }));
        }
        function Qn(t) {
            const e = {
                ...t._computed
            };
            return t._computed = {}, e;
        }
        function Aa(t) {
            for (const e of t.$options.events || []) if (gt(e, "handler")) to(t, e); else for (const i in e) to(t, {
                name: i,
                handler: e[i]
            });
        }
        function to(t, {name: e, el: i, handler: s, capture: n, passive: o, delegate: r, filter: a, self: l}) {
            a && !a.call(t, t) || t._disconnect.push(w(i ? i.call(t, t) : t.$el, e, r == null ? void 0 : r.call(t, t), s.bind(t), {
                passive: o,
                capture: n,
                self: l
            }));
        }
        function Oa(t) {
            for (const e of t.$options.observe || []) Ma(t, e);
        }
        function Ma(t, e) {
            let {observe: i, target: s = t.$el, handler: n, options: o, filter: r, args: a} = e;
            if (r && !r.call(t, t)) return;
            const l = `_observe${t._disconnect.length}`;
            ot(s) && !gt(t, l) && Zn(t, l, () => {
                const d = s.call(t, t);
                return J(d) ? E(d) : d;
            }), n = H(n) ? t[n] : n.bind(t), ot(o) && (o = o.call(t, t));
            const c = gt(t, l) ? t[l] : s, u = i(c, n, o, a);
            ot(s) && J(t[l]) && Jn(t, {
                handler: Da(u, o),
                immediate: !1
            }, l), t._disconnect.push(() => u.disconnect());
        }
        function Da(t, e) {
            return (i, s) => {
                for (const n of s) v(i, n) || (t.unobserve ? t.unobserve(n) : t.observe && t.disconnect());
                for (const n of i) (!v(s, n) || !t.unobserve) && t.observe(n, e);
            };
        }
        function Ba(t) {
            const {$options: e, $props: i} = t, s = eo(e);
            ft(i, s);
            const {computed: n, methods: o} = e;
            for (let r in i) r in s && (!n || !gt(n, r)) && (!o || !gt(o, r)) && (t[r] = i[r]);
        }
        function eo(t) {
            const e = {}, {args: i = [], props: s = {}, el: n, id: o} = t;
            if (!s) return e;
            for (const a in s) {
                const l = Ft(a);
                let c = Z(n, l);
                X(c) || (c = s[a] === Boolean && c === "" ? !0 : vs(s[a], c), !(l === "target" && wt(c, "_")) && (e[a] = c));
            }
            const r = ve(Z(n, o), i);
            for (const a in r) {
                const l = Ee(a);
                X(s[l]) || (e[l] = vs(s[l], r[a]));
            }
            return e;
        }
        const Na = ct((t, e) => {
            const i = Object.keys(e), s = i.concat(t).map(n => [ Ft(n), `data-${Ft(n)}` ]).flat();
            return {
                attributes: i,
                filter: s
            };
        });
        function za(t) {
            const {$options: e, $props: i} = t, {id: s, props: n, el: o} = e;
            if (!n) return;
            const {attributes: r, filter: a} = Na(s, n), l = new MutationObserver(c => {
                const u = eo(e);
                c.some(({attributeName: d}) => {
                    const f = d.replace("data-", "");
                    return (f === s ? r : [ Ee(f), Ee(d) ]).some(p => !X(u[p]) && u[p] !== i[p]);
                }) && t.$reset();
            });
            l.observe(o, {
                attributes: !0,
                attributeFilter: a
            }), t._disconnect.push(() => l.disconnect());
        }
        function we(t, e) {
            var i;
            (i = t.$options[e]) == null || i.forEach(s => s.call(t));
        }
        function Os(t) {
            t._connected || (Ba(t), we(t, "beforeConnect"), t._connected = !0, t._disconnect = [], 
            Aa(t), Zr(t), Ta(t), Oa(t), za(t), _a(t), we(t, "connected"), Ve(t));
        }
        function Ms(t) {
            t._connected && (we(t, "beforeDisconnect"), t._disconnect.forEach(e => e()), t._disconnect = null, 
            we(t, "disconnected"), t._connected = !1);
        }
        let Fa = 0;
        function io(t, e = {}) {
            e.data = Wa(e, t.constructor.options), t.$options = Ue(t.constructor.options, e, t), 
            t.$props = {}, t._uid = Fa++, Ha(t), La(t), Pa(t), we(t, "created"), e.el && t.$mount(e.el);
        }
        function Ha(t) {
            const {data: e = {}} = t.$options;
            for (const i in e) t.$props[i] = t[i] = e[i];
        }
        function La(t) {
            const {methods: e} = t.$options;
            if (e) for (const i in e) t[i] = e[i].bind(t);
        }
        function Wa({data: t = {}}, {args: e = [], props: i = {}}) {
            J(t) && (t = t.slice(0, e.length).reduce((s, n, o) => (Te(n) ? ft(s, n) : s[e[o]] = n, 
            s), {}));
            for (const s in t) X(t[s]) ? delete t[s] : i[s] && (t[s] = vs(i[s], t[s]));
            return t;
        }
        const ht = function(t) {
            io(this, t);
        };
        ht.util = Ur, ht.options = {}, ht.version = "3.23.12";
        const ja = "uk-", Qt = "__uikit__", xe = {};
        function so(t, e) {
            var i, s;
            const n = ja + Ft(t);
            if (!e) return xe[n].options || (xe[n] = ht.extend(xe[n])), xe[n];
            t = Ee(t), ht[t] = (r, a) => Ke(t, r, a);
            const o = (i = e.options) != null ? i : {
                ...e
            };
            return o.id = n, o.name = t, (s = o.install) == null || s.call(o, ht, o, t), ht._initialized && !o.functional && requestAnimationFrame(() => Ke(t, `[${n}],[data-${n}]`)), 
            xe[n] = o;
        }
        function Ke(t, e, i, ...s) {
            const n = so(t);
            return n.options.functional ? new n({
                data: Te(e) ? e : [ e, i, ...s ]
            }) : e ? D(e).map(o)[0] : o();
            function o(r) {
                const a = Ci(r, t);
                if (a) if (i) a.$destroy(); else return a;
                return new n({
                    el: r,
                    data: i
                });
            }
        }
        function Ze(t) {
            return (t == null ? void 0 : t[Qt]) || {};
        }
        function Ci(t, e) {
            return Ze(t)[e];
        }
        function Ra(t, e) {
            t[Qt] || (t[Qt] = {}), t[Qt][e.$options.name] = e;
        }
        function qa(t, e) {
            var i;
            (i = t[Qt]) == null || delete i[e.$options.name], ni(t[Qt]) && delete t[Qt];
        }
        function Ua(t) {
            t.component = so, t.getComponents = Ze, t.getComponent = Ci, t.update = no, t.use = function(i) {
                if (!i.installed) return i.call(null, this), i.installed = !0, this;
            }, t.mixin = function(i, s) {
                s = (H(s) ? this.component(s) : s) || this, s.options = Ue(s.options, i);
            }, t.extend = function(i) {
                i || (i = {});
                const s = this, n = function(r) {
                    io(this, r);
                };
                return n.prototype = Object.create(s.prototype), n.prototype.constructor = n, n.options = Ue(s.options, i), 
                n.super = s, n.extend = s.extend, n;
            };
            let e;
            Object.defineProperty(t, "container", {
                get() {
                    return e || document.body;
                },
                set(i) {
                    e = x(i);
                }
            });
        }
        function no(t, e) {
            t = t ? R(t) : document.body;
            for (const i of fe(t).reverse()) oo(i, e);
            Mt(t, i => oo(i, e));
        }
        function oo(t, e) {
            const i = Ze(t);
            for (const s in i) Ve(i[s], e);
        }
        function Va(t) {
            t.prototype.$mount = function(e) {
                const i = this;
                Ra(e, i), i.$options.el = e, e.isConnected && Os(i);
            }, t.prototype.$destroy = function(e = !1) {
                const i = this, {el: s} = i.$options;
                s && Ms(i), we(i, "destroy"), qa(s, i), e && Q(i.$el);
            }, t.prototype.$create = Ke, t.prototype.$emit = function(e) {
                Ve(this, e);
            }, t.prototype.$update = function(e = this.$el, i) {
                no(e, i);
            }, t.prototype.$reset = function() {
                Ms(this), Os(this);
            }, t.prototype.$getComponent = Ci, Object.defineProperties(t.prototype, {
                $el: {
                    get() {
                        return this.$options.el;
                    }
                },
                $container: Object.getOwnPropertyDescriptor(t, "container")
            });
        }
        let Ya = 1;
        function te(t, e = null) {
            return (e == null ? void 0 : e.id) || `${t.$options.id}-${Ya++}`;
        }
        var Ga = {
            i18n: {
                next: "Next slide",
                previous: "Previous slide",
                slideX: "Slide %s",
                slideLabel: "%s of %s",
                role: "String"
            },
            data: {
                selNav: !1,
                role: "region"
            },
            computed: {
                nav: ({selNav: t}, e) => x(t, e),
                navChildren() {
                    return N(this.nav);
                },
                selNavItem: ({attrItem: t}) => `[${t}],[data-${t}]`,
                navItems(t, e) {
                    return D(this.selNavItem, e);
                }
            },
            watch: {
                nav(t, e) {
                    k(t, "role", "tablist"), this.padNavitems(), e && this.$emit();
                },
                list(t) {
                    F(t, "ul") && k(t, "role", "presentation");
                },
                navChildren(t) {
                    k(t, "role", "presentation"), this.padNavitems(), this.updateNav();
                },
                navItems(t) {
                    for (const e of t) {
                        const i = Z(e, this.attrItem), s = x("a,button", e) || e;
                        let n, o = null;
                        if (mt(i)) {
                            const r = $t(i), a = this.slides[r];
                            a && (a.id || (a.id = te(this, a)), o = a.id), n = this.t("slideX", S(i) + 1), s.role = "tab";
                        } else this.list && (this.list.id || (this.list.id = te(this, this.list)), o = this.list.id), 
                        n = this.t(i);
                        s.ariaControls = o, s.ariaLabel = s.ariaLabel || n;
                    }
                },
                slides(t) {
                    t.forEach((e, i) => k(e, {
                        role: this.nav ? "tabpanel" : "group",
                        "aria-label": this.t("slideLabel", i + 1, this.length),
                        "aria-roledescription": this.nav ? null : "slide"
                    })), this.padNavitems();
                }
            },
            connected() {
                this.$el.role = this.role, this.$el.ariaRoleDescription = "carousel";
            },
            update: [ {
                write() {
                    this.navItems.concat(this.nav).forEach(t => t && (t.hidden = !this.maxIndex)), this.updateNav();
                },
                events: [ "resize" ]
            } ],
            events: [ {
                name: "click keydown",
                delegate: ({selNavItem: t}) => t,
                filter: ({parallax: t}) => !t,
                handler(t) {
                    t.target.closest("a,button") && (t.type === "click" || t.keyCode === B.SPACE) && (Et(t), 
                    this.show(Z(t.current, this.attrItem)));
                }
            }, {
                name: "itemshow",
                handler() {
                    this.updateNav();
                }
            }, {
                name: "keydown",
                delegate: ({selNavItem: t}) => t,
                filter: ({parallax: t}) => !t,
                handler(t) {
                    const {current: e, keyCode: i} = t, s = Z(e, this.attrItem);
                    if (!mt(s)) return;
                    let n = i === B.HOME ? 0 : i === B.END ? "last" : i === B.LEFT ? "previous" : i === B.RIGHT ? "next" : -1;
                    ~n && (t.preventDefault(), this.show(n));
                }
            } ],
            methods: {
                updateNav() {
                    const t = this.getValidIndex();
                    for (const e of this.navItems) {
                        const i = Z(e, this.attrItem), s = x("a,button", e) || e;
                        if (mt(i)) {
                            const o = $t(i) === t;
                            L(e, this.clsActive, o), L(s, "uk-disabled", !!this.parallax), s.ariaSelected = o, 
                            s.tabIndex = o && !this.parallax ? null : -1, o && s && C(O(e), ":focus-within") && s.focus();
                        } else L(e, "uk-invisible", this.finite && (i === "previous" && t === 0 || i === "next" && t >= this.maxIndex));
                    }
                },
                padNavitems() {
                    if (!this.nav) return;
                    const t = [];
                    for (let e = 0; e < this.length; e++) {
                        const i = `${this.attrItem}="${e}"`;
                        t[e] = this.navChildren.findLast(s => s.matches(`[${i}]`)) || x(`<li ${i}><a href></a></li>`);
                    }
                    Ae(t, this.navChildren) || vt(this.nav, t);
                }
            }
        };
        const Xa = "cubic-bezier(0.25, 0.46, 0.45, 0.94)", Ja = "cubic-bezier(0.165, 0.84, 0.44, 1)";
        var ro = {
            mixins: [ ka, Ia, Ga, Ei ],
            props: {
                clsActivated: String,
                easing: String,
                index: Number,
                finite: Boolean,
                velocity: Number
            },
            data: () => ({
                easing: "ease",
                finite: !1,
                velocity: 1,
                index: 0,
                prevIndex: -1,
                stack: [],
                percent: 0,
                clsActive: "uk-active",
                clsActivated: "",
                clsEnter: "uk-slide-enter",
                clsLeave: "uk-slide-leave",
                clsSlideActive: "uk-slide-active",
                Transitioner: !1,
                transitionOptions: {}
            }),
            connected() {
                this.prevIndex = -1, this.index = this.getValidIndex(this.$props.index), this.stack = [];
            },
            disconnected() {
                _(this.slides, this.clsActive);
            },
            computed: {
                duration: ({velocity: t}, e) => ao(e.offsetWidth / t),
                list: ({selList: t}, e) => x(t, e),
                maxIndex() {
                    return this.length - 1;
                },
                slides() {
                    return N(this.list);
                },
                length() {
                    return this.slides.length;
                }
            },
            watch: {
                slides(t, e) {
                    e && this.$emit();
                }
            },
            events: {
                itemshow({target: t}) {
                    I(t, this.clsEnter, this.clsSlideActive);
                },
                itemshown({target: t}) {
                    _(t, this.clsEnter);
                },
                itemhide({target: t}) {
                    I(t, this.clsLeave);
                },
                itemhidden({target: t}) {
                    _(t, this.clsLeave, this.clsSlideActive);
                }
            },
            methods: {
                async show(t, e = !1) {
                    var i;
                    if (this.dragging || !this.length || this.parallax) return;
                    const {stack: s} = this, n = e ? 0 : s.length, o = () => {
                        s.splice(n, 1), s.length && this.show(s.shift(), !0);
                    };
                    if (s[e ? "unshift" : "push"](t), !e && s.length > 1) {
                        s.length === 2 && ((i = this._transitioner) == null || i.forward(Math.min(this.duration, 200)));
                        return;
                    }
                    const r = this.getIndex(this.index), a = $(this.slides, this.clsActive) && this.slides[r], l = this.getIndex(t, this.index), c = this.slides[l];
                    if (a === c) {
                        o();
                        return;
                    }
                    if (this.dir = Ka(t, r), this.prevIndex = r, this.index = l, a && !m(a, "beforeitemhide", [ this ]) || !m(c, "beforeitemshow", [ this, a ])) {
                        this.index = this.prevIndex, o();
                        return;
                    }
                    a && m(a, "itemhide", [ this ]), m(c, "itemshow", [ this ]), await this._show(a, c, e), 
                    a && m(a, "itemhidden", [ this ]), m(c, "itemshown", [ this ]), s.shift(), this._transitioner = null, 
                    s.length && requestAnimationFrame(() => s.length && this.show(s.shift(), !0));
                },
                getIndex(t = this.index, e = this.index) {
                    return K(rt(t, this.slides, e, this.finite), 0, Math.max(0, this.maxIndex));
                },
                getValidIndex(t = this.index, e = this.prevIndex) {
                    return this.getIndex(t, e);
                },
                async _show(t, e, i) {
                    if (this._transitioner = this._getTransitioner(t, e, this.dir, {
                        easing: i ? e.offsetWidth < 600 ? Xa : Ja : this.easing,
                        ...this.transitionOptions
                    }), !i && !t) {
                        this._translate(1);
                        return;
                    }
                    const {length: s} = this.stack;
                    return this._transitioner[s > 1 ? "forward" : "show"](s > 1 ? Math.min(this.duration, 75 + 75 / (s - 1)) : this.duration, this.percent);
                },
                _translate(t, e = this.prevIndex, i = this.index) {
                    const s = this._getTransitioner(e === i ? !1 : e, i);
                    return s.translate(t), s;
                },
                _getTransitioner(t = this.prevIndex, e = this.index, i = this.dir || 1, s = this.transitionOptions) {
                    return new this.Transitioner(_e(t) ? this.slides[t] : t, _e(e) ? this.slides[e] : e, i * (U ? -1 : 1), s);
                }
            }
        };
        function Ka(t, e) {
            return t === "next" ? 1 : t === "previous" || t < e ? -1 : 1;
        }
        function ao(t) {
            return .5 * t + 300;
        }
        var lo = {
            mixins: [ ro ],
            props: {
                animation: String
            },
            data: {
                animation: "slide",
                clsActivated: "uk-transition-active",
                Animations: _s,
                Transitioner: ya
            },
            computed: {
                animation({animation: t, Animations: e}) {
                    return {
                        ...e[t] || e.slide,
                        name: t
                    };
                },
                transitionOptions() {
                    return {
                        animation: this.animation
                    };
                }
            },
            observe: dt(),
            events: {
                itemshow({target: t}) {
                    I(t, this.clsActive);
                },
                itemshown({target: t}) {
                    I(t, this.clsActivated);
                },
                itemhidden({target: t}) {
                    _(t, this.clsActive, this.clsActivated);
                }
            }
        }, Za = {
            ..._s,
            fade: {
                show() {
                    return [ {
                        opacity: 0,
                        zIndex: 0
                    }, {
                        zIndex: -1
                    } ];
                },
                percent(t) {
                    return 1 - h(t, "opacity");
                },
                translate(t) {
                    return [ {
                        opacity: 1 - t,
                        zIndex: 0
                    }, {
                        zIndex: -1
                    } ];
                }
            },
            scale: {
                show() {
                    return [ {
                        opacity: 0,
                        transform: $e(1 + .5),
                        zIndex: 0
                    }, {
                        zIndex: -1
                    } ];
                },
                percent(t) {
                    return 1 - h(t, "opacity");
                },
                translate(t) {
                    return [ {
                        opacity: 1 - t,
                        transform: $e(1 + .5 * t),
                        zIndex: 0
                    }, {
                        zIndex: -1
                    } ];
                }
            },
            pull: {
                show(t) {
                    return t < 0 ? [ {
                        transform: j(30),
                        zIndex: -1
                    }, {
                        transform: j(),
                        zIndex: 0
                    } ] : [ {
                        transform: j(-100),
                        zIndex: 0
                    }, {
                        transform: j(),
                        zIndex: -1
                    } ];
                },
                percent(t, e, i) {
                    return i < 0 ? 1 - Je(e) : Je(t);
                },
                translate(t, e) {
                    return e < 0 ? [ {
                        transform: j(30 * t),
                        zIndex: -1
                    }, {
                        transform: j(-100 * (1 - t)),
                        zIndex: 0
                    } ] : [ {
                        transform: j(-t * 100),
                        zIndex: 0
                    }, {
                        transform: j(30 * (1 - t)),
                        zIndex: -1
                    } ];
                }
            },
            push: {
                show(t) {
                    return t < 0 ? [ {
                        transform: j(100),
                        zIndex: 0
                    }, {
                        transform: j(),
                        zIndex: -1
                    } ] : [ {
                        transform: j(-30),
                        zIndex: -1
                    }, {
                        transform: j(),
                        zIndex: 0
                    } ];
                },
                percent(t, e, i) {
                    return i > 0 ? 1 - Je(e) : Je(t);
                },
                translate(t, e) {
                    return e < 0 ? [ {
                        transform: j(t * 100),
                        zIndex: 0
                    }, {
                        transform: j(-30 * (1 - t)),
                        zIndex: -1
                    } ] : [ {
                        transform: j(-30 * t),
                        zIndex: -1
                    }, {
                        transform: j(100 * (1 - t)),
                        zIndex: 0
                    } ];
                }
            }
        };
        function $e(t) {
            return `scale3d(${t}, ${t}, 1)`;
        }
        var ho = {
            ..._s,
            fade: {
                show() {
                    return [ {
                        opacity: 0
                    }, {
                        opacity: 1
                    } ];
                },
                percent(t) {
                    return 1 - h(t, "opacity");
                },
                translate(t) {
                    return [ {
                        opacity: 1 - t
                    }, {
                        opacity: t
                    } ];
                }
            },
            scale: {
                show() {
                    return [ {
                        opacity: 0,
                        transform: $e(1 - .2)
                    }, {
                        opacity: 1,
                        transform: $e(1)
                    } ];
                },
                percent(t) {
                    return 1 - h(t, "opacity");
                },
                translate(t) {
                    return [ {
                        opacity: 1 - t,
                        transform: $e(1 - .2 * t)
                    }, {
                        opacity: t,
                        transform: $e(1 - .2 + .2 * t)
                    } ];
                }
            }
        }, co = {
            i18n: {
                counter: "%s / %s"
            },
            mixins: [ Ps, lo ],
            functional: !0,
            props: {
                counter: Boolean,
                preload: Number,
                nav: Boolean,
                slidenav: Boolean,
                delayControls: Number,
                videoAutoplay: Boolean,
                template: String
            },
            data: () => ({
                counter: !1,
                preload: 1,
                nav: !1,
                slidenav: !0,
                delayControls: 3e3,
                videoAutoplay: !1,
                items: [],
                cls: "uk-open",
                clsPage: "uk-lightbox-page",
                clsFit: "uk-lightbox-items-fit",
                clsZoom: "uk-lightbox-zoom",
                attrItem: "uk-lightbox-item",
                selList: ".uk-lightbox-items",
                selClose: ".uk-close-large",
                selNav: ".uk-lightbox-thumbnav, .uk-lightbox-dotnav",
                selCaption: ".uk-lightbox-caption",
                selCounter: ".uk-lightbox-counter",
                pauseOnHover: !1,
                velocity: 2,
                Animations: ho,
                template: '<div class="uk-lightbox uk-overflow-hidden"> <div class="uk-lightbox-items"></div> <div class="uk-position-top-right uk-position-small uk-transition-fade" uk-inverse> <button class="uk-lightbox-close uk-close-large" type="button" uk-close></button> </div> <div class="uk-lightbox-slidenav uk-position-center-left uk-position-medium uk-transition-fade" uk-inverse> <a href uk-slidenav-previous uk-lightbox-item="previous"></a> </div> <div class="uk-lightbox-slidenav uk-position-center-right uk-position-medium uk-transition-fade" uk-inverse> <a href uk-slidenav-next uk-lightbox-item="next"></a> </div> <div class="uk-position-center-right uk-position-medium uk-transition-fade" uk-inverse style="max-height: 90vh; overflow: auto;"> <ul class="uk-lightbox-thumbnav uk-lightbox-thumbnav-vertical uk-thumbnav uk-thumbnav-vertical"></ul> <ul class="uk-lightbox-dotnav uk-dotnav uk-dotnav-vertical"></ul> </div> <div class="uk-lightbox-counter uk-text-large uk-position-top-left uk-position-small uk-transition-fade" uk-inverse></div> <div class="uk-lightbox-caption uk-position-bottom uk-text-center uk-transition-slide-bottom uk-transition-opaque"></div> </div>'
            }),
            created() {
                let t = x(this.template);
                F(t, "template") && (t = It(vt(t)));
                const e = x(this.selList, t), i = this.$props.nav;
                Q(D(this.selNav, t).filter(o => !C(o, `.uk-${i}`)));
                for (const [o, r] of this.items.entries()) W(e, "<div>"), i === "thumbnav" && Le(Qa(r, this.videoAutoplay), W(x(this.selNav, t), `<li uk-lightbox-item="${o}"><a href></a></li>`));
                this.slidenav || Q(D(".uk-lightbox-slidenav", t)), this.counter || Q(x(this.selCounter, t)), 
                I(e, this.clsFit);
                const s = x("[uk-close]", t), n = this.t("close");
                s && n && (s.dataset.i18n = JSON.stringify({
                    label: n
                })), this.$mount(W(this.container, t));
            },
            events: [ {
                name: "click",
                self: !0,
                filter: ({bgClose: t}) => t,
                delegate: ({selList: t}) => `${t} > *`,
                handler(t) {
                    t.defaultPrevented || this.hide();
                }
            }, {
                name: "click",
                self: !0,
                delegate: ({clsZoom: t}) => `.${t}`,
                handler(t) {
                    t.defaultPrevented || L(this.list, this.clsFit);
                }
            }, {
                name: `${Me} ${ut} keydown`,
                filter: ({delayControls: t}) => t,
                handler() {
                    this.showControls();
                }
            }, {
                name: "shown",
                self: !0,
                handler() {
                    this.showControls();
                }
            }, {
                name: "hide",
                self: !0,
                handler() {
                    this.hideControls(), _(this.slides, this.clsActive), M.stop(this.slides);
                }
            }, {
                name: "hidden",
                self: !0,
                handler() {
                    this.$destroy(!0);
                }
            }, {
                name: "keyup",
                el: () => document,
                handler({keyCode: t}) {
                    if (!this.isToggled() || !this.draggable) return;
                    let e = -1;
                    t === B.LEFT ? e = "previous" : t === B.RIGHT ? e = "next" : t === B.HOME ? e = 0 : t === B.END && (e = "last"), 
                    ~e && this.show(e);
                }
            }, {
                name: "beforeitemshow",
                handler(t) {
                    vt(x(this.selCaption, this.$el), this.getItem().caption || ""), vt(x(this.selCounter, this.$el), this.t("counter", this.index + 1, this.slides.length));
                    for (let e = -this.preload; e <= this.preload; e++) this.loadItem(this.index + e);
                    this.isToggled() || (this.draggable = !1, t.preventDefault(), this.toggleElement(this.$el, !0, !1), 
                    this.animation = ho.scale, _(t.target, this.clsActive), this.stack.splice(1, 0, this.index));
                }
            }, {
                name: "itemshown",
                handler() {
                    this.draggable = this.$props.draggable;
                }
            }, {
                name: "itemload",
                async handler(t, e) {
                    const {source: i, type: s, attrs: n = {}} = e;
                    if (this.setItem(e, "<span uk-spinner uk-inverse></span>"), !i) return;
                    let o;
                    const r = {
                        allowfullscreen: "",
                        style: "max-width: 100%; box-sizing: border-box;",
                        "uk-responsive": "",
                        "uk-video": `${!!this.videoAutoplay}`
                    };
                    if (s === "image" || uo(i)) {
                        const a = Nt("img");
                        Wn(a, e.sources), k(a, {
                            src: i,
                            ...oi(e, [ "alt", "srcset", "sizes" ]),
                            ...n
                        }), w(a, "load", () => this.setItem(e, O(a) || a)), w(a, "error", () => this.setError(e));
                    } else if (s === "video" || fo(i)) {
                        const a = this.videoAutoplay === "inline", l = Nt("video", {
                            src: i,
                            playsinline: "",
                            controls: a ? null : "",
                            loop: a ? "" : null,
                            poster: this.videoAutoplay ? null : e.poster,
                            "uk-video": a ? "automute: true" : !!this.videoAutoplay,
                            ...n
                        });
                        w(l, "loadedmetadata", () => this.setItem(e, l)), w(l, "error", () => this.setError(e));
                    } else if (s === "iframe" || i.match(/\.(html|php)($|\?)/i)) this.setItem(e, Nt("iframe", {
                        src: i,
                        allowfullscreen: "",
                        class: "uk-lightbox-iframe",
                        ...n
                    })); else if (o = i.match(/\/\/(?:.*?youtube(-nocookie)?\..*?(?:[?&]v=|\/shorts\/)|youtu\.be\/)([\w-]{11})[&?]?(.*)?/)) this.setItem(e, Nt("iframe", {
                        src: `https://www.youtube${o[1] || ""}.com/embed/${o[2]}${o[3] ? `?${o[3]}` : ""}`,
                        width: 1920,
                        height: 1080,
                        ...r,
                        ...n
                    })); else if (o = i.match(/\/\/.*?vimeo\.[a-z]+\/(\d+)[&?]?(.*)?/)) try {
                        const {height: a, width: l} = await (await fetch(`https://vimeo.com/api/oembed.json?maxwidth=1920&url=${encodeURI(i)}`, {
                            credentials: "omit"
                        })).json();
                        this.setItem(e, Nt("iframe", {
                            src: `https://player.vimeo.com/video/${o[1]}${o[2] ? `?${o[2]}` : ""}`,
                            width: l,
                            height: a,
                            ...r,
                            ...n
                        }));
                    } catch {
                        this.setError(e);
                    }
                }
            }, {
                name: "itemloaded",
                handler() {
                    this.$emit("resize");
                }
            } ],
            update: {
                read() {
                    for (const t of D(`${this.selList} :not([controls]):is(img,video)`, this.$el)) L(t, this.clsZoom, (t.naturalHeight || t.videoHeight) - this.$el.offsetHeight > Math.max(0, (t.naturalWidth || t.videoWidth) - this.$el.offsetWidth));
                },
                events: [ "resize" ]
            },
            methods: {
                loadItem(t = this.index) {
                    const e = this.getItem(t);
                    this.getSlide(e).childElementCount || m(this.$el, "itemload", [ e ]);
                },
                getItem(t = this.index) {
                    return this.items[rt(t, this.slides)];
                },
                setItem(t, e) {
                    m(this.$el, "itemloaded", [ this, vt(this.getSlide(t), e) ]);
                },
                getSlide(t) {
                    return this.slides[this.items.indexOf(t)];
                },
                setError(t) {
                    this.setItem(t, '<span uk-icon="icon: bolt; ratio: 2" uk-inverse></span>');
                },
                showControls() {
                    clearTimeout(this.controlsTimer), this.controlsTimer = this.delayControls && setTimeout(this.hideControls, this.delayControls), 
                    I(this.$el, "uk-active", "uk-transition-active");
                },
                hideControls() {
                    _(this.$el, "uk-active", "uk-transition-active");
                }
            }
        };
        function Nt(t, e) {
            const i = It(`<${t}>`);
            return k(i, e), i;
        }
        function Qa(t, e) {
            const i = t.poster || t.thumb && (t.type === "image" || uo(t.thumb)) ? Nt("img", {
                src: t.poster || t.thumb,
                alt: ""
            }) : t.thumb && (t.type === "video" || fo(t.thumb)) ? Nt("video", {
                src: t.thumb,
                loop: "",
                playsinline: "",
                "uk-video": `autoplay: ${!!e}; automute: true`
            }) : Nt("canvas");
            return t.thumbRatio && (i.style.aspectRatio = t.thumbRatio), i;
        }
        function uo(t) {
            return t == null ? void 0 : t.match(/\.(avif|jpe?g|jfif|a?png|gif|svg|webp)($|\?)/i);
        }
        function fo(t) {
            return t == null ? void 0 : t.match(/\.(mp4|webm|ogv)($|\?)/i);
        }
        const tl = ".uk-disabled *, .uk-disabled, [disabled]";
        var el = {
            install: il,
            props: {
                toggle: String
            },
            data: {
                toggle: "a"
            },
            computed: {
                toggles: ({toggle: t}, e) => D(t, e)
            },
            watch: {
                toggles(t) {
                    this.hide();
                    for (const e of t) F(e, "a") && (e.role = "button");
                }
            },
            disconnected() {
                this.hide();
            },
            events: {
                name: "click",
                delegate: ({toggle: t}) => t,
                handler(t) {
                    t.defaultPrevented || (t.preventDefault(), C(t.current, tl) || this.show(t.current));
                }
            },
            methods: {
                show(t) {
                    let e = this.toggles.map(po);
                    if (this.nav === "thumbnav" && sl.call(this, this.toggles, e), e = Ys(e, "source"), 
                    ae(t)) {
                        const {source: i} = po(t);
                        t = xt(e, ({source: s}) => i === s);
                    }
                    return this.panel = this.panel || this.$create("lightboxPanel", {
                        ...this.$props,
                        items: e
                    }), w(this.panel.$el, "hidden", () => this.panel = null), this.panel.show(t);
                },
                hide() {
                    var t;
                    return (t = this.panel) == null ? void 0 : t.hide();
                }
            }
        };
        function il(t, e) {
            t.lightboxPanel || t.component("lightboxPanel", co), ft(e.props, t.component("lightboxPanel").options.props);
        }
        function sl(t, e) {
            for (const [i, s] of Object.entries(t)) {
                if (e[i].thumb) continue;
                const n = fe(s).reverse().concat(s).find(r => this.$el.contains(r) && (r === s || D(this.toggle, r).length === 1));
                if (!n) continue;
                const o = x("img,video", n);
                o && (e[i].thumb = o.currentSrc || o.poster || o.src, e[i].thumbRatio = (o.naturalWidth || o.videoWidth) / (o.naturalHeight || o.videoHeight));
            }
        }
        function po(t) {
            const e = {};
            for (const i of t.getAttributeNames()) {
                const s = i.replace(/^data-/, "");
                e[s === "href" ? "source" : s] = t.getAttribute(i);
            }
            return e.attrs = ve(e.attrs), e;
        }
        var nl = {
            mixins: [ Xe ],
            functional: !0,
            args: [ "message", "status" ],
            data: {
                message: "",
                status: "",
                timeout: 5e3,
                group: "",
                pos: "top-center",
                clsContainer: "uk-notification",
                clsClose: "uk-notification-close",
                clsMsg: "uk-notification-message"
            },
            install: ol,
            computed: {
                marginProp: ({pos: t}) => `margin-${t.match(/[a-z]+(?=-)/)[0]}`,
                startProps() {
                    return {
                        opacity: 0,
                        [this.marginProp]: -this.$el.offsetHeight
                    };
                }
            },
            created() {
                const t = `${this.clsContainer}-${this.pos}`, e = `data-${this.clsContainer}-container`, i = x(`.${t}[${e}]`, this.container) || W(this.container, `<div class="${this.clsContainer} ${t}" ${e}></div>`);
                this.$mount(W(i, `<div class="${this.clsMsg}${this.status ? ` ${this.clsMsg}-${this.status}` : ""}" role="alert"> <a href class="${this.clsClose}" data-uk-close></a> <div>${this.message}</div> </div>`));
            },
            async connected() {
                const t = S(h(this.$el, this.marginProp));
                await M.start(h(this.$el, this.startProps), {
                    opacity: 1,
                    [this.marginProp]: t
                }), this.timeout && (this.timer = setTimeout(this.close, this.timeout));
            },
            events: {
                click(t) {
                    Et(t), this.close();
                },
                [At]() {
                    this.timer && clearTimeout(this.timer);
                },
                [Ut]() {
                    this.timeout && (this.timer = setTimeout(this.close, this.timeout));
                }
            },
            methods: {
                async close(t) {
                    const e = i => {
                        const s = O(i);
                        m(i, "close", [ this ]), Q(i), s != null && s.hasChildNodes() || Q(s);
                    };
                    this.timer && clearTimeout(this.timer), t || await M.start(this.$el, this.startProps), 
                    e(this.$el);
                }
            }
        };
        function ol(t) {
            t.notification.closeAll = function(e, i) {
                Mt(document.body, s => {
                    const n = t.getComponent(s, "notification");
                    n && (!e || e === n.group) && n.close(i);
                });
            };
        }
        var Pi = {
            props: {
                media: Boolean
            },
            data: {
                media: !1
            },
            connected() {
                const t = rl(this.media, this.$el);
                if (this.matchMedia = !0, t) {
                    this.mediaObj = window.matchMedia(t);
                    const e = () => {
                        this.matchMedia = this.mediaObj.matches, m(this.$el, pe("mediachange", !1, !0, [ this.mediaObj ]));
                    };
                    this.offMediaObj = w(this.mediaObj, "change", () => {
                        e(), this.$emit("resize");
                    }), e();
                }
            },
            disconnected() {
                var t;
                (t = this.offMediaObj) == null || t.call(this);
            }
        };
        function rl(t, e) {
            if (H(t)) if (wt(t, "@")) t = S(h(e, `--uk-breakpoint-${t.slice(1)}`)); else if (isNaN(t)) return t;
            return t && mt(t) ? `(min-width: ${t}px)` : "";
        }
        function go(t) {
            return q(t) ? Math.ceil(Math.max(0, ...D("[stroke]", t).map(e => {
                var i;
                return ((i = e.getTotalLength) == null ? void 0 : i.call(e)) || 0;
            }))) : 0;
        }
        const _i = {
            x: Ai,
            y: Ai,
            rotate: Ai,
            scale: Ai,
            color: Ds,
            backgroundColor: Ds,
            borderColor: Ds,
            blur: ee,
            hue: ee,
            fopacity: ee,
            grayscale: ee,
            invert: ee,
            saturate: ee,
            sepia: ee,
            opacity: ll,
            stroke: hl,
            bgx: bo,
            bgy: bo
        }, {keys: mo} = Object;
        var vo = {
            mixins: [ Pi ],
            props: ko(mo(_i), "list"),
            data: ko(mo(_i), void 0),
            computed: {
                props(t, e) {
                    const i = {};
                    for (const n in t) n in _i && !X(t[n]) && (i[n] = t[n].slice());
                    const s = {};
                    for (const n in i) s[n] = _i[n](n, e, i[n], i);
                    return s;
                }
            },
            events: {
                load() {
                    this.$emit();
                }
            },
            methods: {
                reset() {
                    St(this.$el, this.getCss(0));
                },
                getCss(t) {
                    const e = {};
                    for (const i in this.props) this.props[i](e, K(t));
                    return e.willChange = Object.keys(e).map(di).join(","), e;
                }
            }
        };
        function Ai(t, e, i) {
            let n, s = Mi(i) || {
                x: "px",
                y: "px",
                rotate: "deg"
            }[t] || "";
            return t === "x" || t === "y" ? (t = `translate${Ht(t)}`, n = o => S(S(o).toFixed(s === "px" ? 0 : 6))) : t === "scale" && (s = "", 
            n = o => {
                var r;
                return Mi([ o ]) ? G(o, "width", e, !0) / e[`offset${(r = o.endsWith) != null && r.call(o, "vh") ? "Height" : "Width"}`] : S(o);
            }), i.length === 1 && i.unshift(t === "scale" ? 1 : 0), i = ye(i, n), (o, r) => {
                o.transform = `${o.transform || ""} ${t}(${Qe(i, r)}${s})`;
            };
        }
        function Ds(t, e, i) {
            return i.length === 1 && i.unshift(ti(e, t, "")), i = ye(i, s => al(e, s)), (s, n) => {
                const [o, r, a] = yo(i, n), l = o.map((c, u) => (c += a * (r[u] - c), u === 3 ? S(c) : parseInt(c, 10))).join(",");
                s[t] = `rgba(${l})`;
            };
        }
        function al(t, e) {
            return ti(t, "color", e).split(/[(),]/g).slice(1, -1).concat(1).slice(0, 4).map(S);
        }
        function ee(t, e, i) {
            i.length === 1 && i.unshift(0);
            const s = Mi(i) || {
                blur: "px",
                hue: "deg"
            }[t] || "%";
            return t = {
                fopacity: "opacity",
                hue: "hue-rotate"
            }[t] || t, i = ye(i), (n, o) => {
                const r = Qe(i, o);
                n.filter = `${n.filter || ""} ${t}(${r + s})`;
            };
        }
        function ll(t, e, i) {
            return i.length === 1 && i.unshift(ti(e, t, "")), i = ye(i), (s, n) => {
                s[t] = Qe(i, n);
            };
        }
        function hl(t, e, i) {
            i.length === 1 && i.unshift(0);
            const s = Mi(i), n = go(e);
            return i = ye(i.reverse(), o => (o = S(o), s === "%" ? o * n / 100 : o)), i.some(([o]) => o) ? (h(e, "strokeDasharray", n), 
            (o, r) => {
                o.strokeDashoffset = Qe(i, r);
            }) : A;
        }
        function bo(t, e, i, s) {
            i.length === 1 && i.unshift(0);
            const n = t === "bgy" ? "height" : "width";
            s[t] = ye(i, a => G(a, n, e));
            const o = [ "bgx", "bgy" ].filter(a => a in s);
            if (o.length === 2 && t === "bgx") return A;
            if (ti(e, "backgroundSize", "") === "cover") return cl(t, e, i, s);
            const r = {};
            for (const a of o) r[a] = wo(e, a);
            return xo(o, r, s);
        }
        function cl(t, e, i, s) {
            const n = ul(e);
            if (!n.width) return A;
            const o = {
                width: e.offsetWidth,
                height: e.offsetHeight
            }, r = [ "bgx", "bgy" ].filter(u => u in s), a = {};
            for (const u of r) {
                const d = s[u].map(([P]) => P), f = Math.min(...d), p = Math.max(...d), b = d.indexOf(f) < d.indexOf(p), y = p - f;
                a[u] = `${(b ? -y : 0) - (b ? f : p)}px`, o[u === "bgy" ? "height" : "width"] += y;
            }
            const l = Ui.cover(n, o);
            for (const u of r) {
                const d = u === "bgy" ? "height" : "width", f = l[d] - o[d];
                a[u] = `max(${wo(e, u)},-${f}px) + ${a[u]}`;
            }
            const c = xo(r, a, s);
            return (u, d) => {
                c(u, d), u.backgroundSize = `${l.width}px ${l.height}px`, u.backgroundRepeat = "no-repeat";
            };
        }
        function wo(t, e) {
            return ti(t, `background-position-${e.slice(-1)}`, "");
        }
        function xo(t, e, i) {
            return function(s, n) {
                for (const o of t) {
                    const r = Qe(i[o], n);
                    s[`background-position-${o.slice(-1)}`] = `calc(${e[o]} + ${r}px)`;
                }
            };
        }
        const $o = {}, Oi = {};
        function ul(t) {
            const e = h(t, "backgroundImage").replace(/^none|url\(["']?(.+?)["']?\)$/, "$1");
            if (Oi[e]) return Oi[e];
            const i = new Image;
            return e && (i.src = e, !i.naturalWidth && !$o[e]) ? (z(i, "error load", () => {
                Oi[e] = Bs(i), m(t, pe("load", !1));
            }), $o[e] = !0, Bs(i)) : Oi[e] = Bs(i);
        }
        function Bs(t) {
            return {
                width: t.naturalWidth,
                height: t.naturalHeight
            };
        }
        function ye(t, e = S) {
            const i = [], {length: s} = t;
            let n = 0;
            for (let o = 0; o < s; o++) {
                let [r, a] = H(t[o]) ? t[o].trim().split(/ (?![^(]*\))/) : [ t[o] ];
                if (r = e(r), a = a ? S(a) / 100 : null, o === 0 ? a === null ? a = 0 : a && i.push([ r, 0 ]) : o === s - 1 && (a === null ? a = 1 : a !== 1 && (i.push([ r, a ]), 
                a = 1)), i.push([ r, a ]), a === null) n++; else if (n) {
                    const l = i[o - n - 1][1], c = (a - l) / (n + 1);
                    for (let u = n; u > 0; u--) i[o - u][1] = l + c * (n - u + 1);
                    n = 0;
                }
            }
            return i;
        }
        function yo(t, e) {
            const i = xt(t.slice(1), ([, s]) => e <= s) + 1;
            return [ t[i - 1][0], t[i][0], (e - t[i - 1][1]) / (t[i][1] - t[i - 1][1]) ];
        }
        function Qe(t, e) {
            const [i, s, n] = yo(t, e);
            return i + Math.abs(i - s) * n * (i < s ? 1 : -1);
        }
        const dl = /^-?\d+(?:\.\d+)?(\S+)?/;
        function Mi(t, e) {
            var i;
            for (const s of t) {
                const n = (i = s.match) == null ? void 0 : i.call(s, dl);
                if (n) return n[1];
            }
            return e;
        }
        function ti(t, e, i) {
            const s = t.style[e], n = h(h(t, e, i), e);
            return t.style[e] = s, n;
        }
        function ko(t, e) {
            return t.reduce((i, s) => (i[s] = e, i), {});
        }
        function So(t, e) {
            return e >= 0 ? Math.pow(t, e + 1) : 1 - Math.pow(1 - t, 1 - e);
        }
        var fl = {
            mixins: [ vo ],
            props: {
                target: String,
                viewport: Number,
                easing: Number,
                start: String,
                end: String
            },
            data: {
                target: !1,
                viewport: 1,
                easing: 1,
                start: 0,
                end: 0
            },
            computed: {
                target: ({target: t}, e) => Io(t && et(t, e) || e),
                start({start: t}) {
                    return G(t, "height", this.target, !0);
                },
                end({end: t, viewport: e}) {
                    return G(t || (e = (1 - e) * 100) && `${e}vh+${e}%`, "height", this.target, !0);
                }
            },
            observe: [ bs(), Ye({
                target: ({target: t}) => t
            }), dt({
                target: ({$el: t, target: e}) => [ t, e, Bt(e, !0) ]
            }) ],
            update: {
                read({percent: t}, e) {
                    if (e.has("scroll") || (t = !1), !q(this.$el)) return !1;
                    if (!this.matchMedia) return;
                    const i = t;
                    return t = So(yi(this.target, this.start, this.end), this.easing), {
                        percent: t,
                        style: i === t ? !1 : this.getCss(t)
                    };
                },
                write({style: t}) {
                    if (!this.matchMedia) {
                        this.reset();
                        return;
                    }
                    t && h(this.$el, t);
                },
                events: [ "scroll", "resize" ]
            }
        };
        function Io(t) {
            return t ? "offsetTop" in t ? t : Io(O(t)) : document.documentElement;
        }
        var Eo = {
            props: {
                parallax: Boolean,
                parallaxTarget: Boolean,
                parallaxStart: String,
                parallaxEnd: String,
                parallaxEasing: Number
            },
            data: {
                parallax: !1,
                parallaxTarget: !1,
                parallaxStart: 0,
                parallaxEnd: 0,
                parallaxEasing: 0
            },
            observe: [ dt({
                target: ({$el: t, parallaxTarget: e}) => [ t, e ],
                filter: ({parallax: t}) => t
            }), Ye({
                filter: ({parallax: t}) => t
            }) ],
            computed: {
                parallaxTarget({parallaxTarget: t}, e) {
                    return t && et(t, e) || this.list;
                }
            },
            update: {
                read() {
                    if (!this.parallax) return !1;
                    const t = this.parallaxTarget;
                    if (!t) return !1;
                    const e = G(this.parallaxStart, "height", t, !0), i = G(this.parallaxEnd, "height", t, !0), s = So(yi(t, e, i), this.parallaxEasing);
                    return {
                        parallax: this.getIndexAt(s)
                    };
                },
                write({parallax: t}) {
                    const [e, i] = t, s = this.getValidIndex(e + Math.ceil(i)), n = this.slides[e], o = this.slides[s], {triggerShow: r, triggerShown: a, triggerHide: l, triggerHidden: c} = pl(this);
                    if (~this.prevIndex) for (const d of new Set([ this.index, this.prevIndex ])) v([ s, e ], d) || (l(this.slides[d]), 
                    c(this.slides[d]));
                    const u = this.prevIndex !== e || this.index !== s;
                    this.dir = 1, this.prevIndex = e, this.index = s, n !== o && l(n), r(o), u && a(n), 
                    this._translate(n === o ? 1 : i, n, o);
                },
                events: [ "scroll", "resize" ]
            },
            methods: {
                getIndexAt(t) {
                    const e = t * (this.length - 1);
                    return [ Math.floor(e), e % 1 ];
                }
            }
        };
        function pl(t) {
            const {clsSlideActive: e, clsEnter: i, clsLeave: s} = t;
            return {
                triggerShow: n,
                triggerShown: o,
                triggerHide: r,
                triggerHidden: a
            };
            function n(l) {
                $(l, s) && (r(l), a(l)), $(l, e) || (m(l, "beforeitemshow", [ t ]), m(l, "itemshow", [ t ]));
            }
            function o(l) {
                $(l, i) && m(l, "itemshown", [ t ]);
            }
            function r(l) {
                $(l, e) || n(l), $(l, i) && o(l), $(l, s) || (m(l, "beforeitemhide", [ t ]), m(l, "itemhide", [ t ]));
            }
            function a(l) {
                $(l, s) && m(l, "itemhidden", [ t ]);
            }
        }
        var To = {
            update: {
                write() {
                    if (this.stack.length || this.dragging || this.parallax) return;
                    const t = this.getValidIndex();
                    !~this.prevIndex || this.index !== t ? this.show(t) : this._translate(1);
                },
                events: [ "resize" ]
            }
        }, Co = {
            observe: Ii({
                target: ({slides: t}) => t,
                targets: t => t.getAdjacentSlides()
            }),
            methods: {
                getAdjacentSlides() {
                    return [ 1, -1 ].map(t => this.slides[this.getIndex(this.index + t)]);
                }
            }
        };
        function gl(t, e, i, {center: s, easing: n, list: o}) {
            const r = t ? ei(t, o, s) : ei(e, o, s) + g(e).width * i, a = e ? ei(e, o, s) : r + g(t).width * i * (U ? -1 : 1), {promise: l, resolve: c} = Vn();
            return {
                dir: i,
                show(u, d = 0, f) {
                    const p = f ? "linear" : n;
                    return u -= Math.round(u * K(d, -1, 1)), h(o, "transitionProperty", "none"), this.translate(d), 
                    h(o, "transitionProperty", ""), d = t ? d : K(d, 0, 1), Zt(this.getItemIn(), "itemin", {
                        percent: d,
                        duration: u,
                        timing: p,
                        dir: i
                    }), t && Zt(this.getItemIn(!0), "itemout", {
                        percent: 1 - d,
                        duration: u,
                        timing: p,
                        dir: i
                    }), M.start(o, {
                        transform: j(-a * (U ? -1 : 1), "px")
                    }, u, p).then(c, A), l;
                },
                cancel() {
                    return M.cancel(o);
                },
                reset() {
                    h(o, "transform", "");
                },
                async forward(u, d = this.percent()) {
                    return await this.cancel(), this.show(u, d, !0);
                },
                translate(u) {
                    if (u === this.percent()) return;
                    const d = this.getDistance() * i * (U ? -1 : 1);
                    h(o, "transform", j(K(-a + (d - d * u), -ke(o), g(o).width) * (U ? -1 : 1), "px"));
                    const f = this.getActives(), p = this.getItemIn(), b = this.getItemIn(!0);
                    u = t ? K(u, -1, 1) : 0;
                    for (const y of N(o)) {
                        const P = v(f, y), it = y === p, Tt = y === b, zt = it || !Tt && (P || i * (U ? -1 : 1) === -1 ^ Di(y, o) > Di(t || e));
                        Zt(y, `itemtranslate${zt ? "in" : "out"}`, {
                            dir: i,
                            percent: Tt ? 1 - u : it ? u : P ? 1 : 0
                        });
                    }
                },
                percent() {
                    return Math.abs((new DOMMatrix(h(o, "transform")).m41 * (U ? -1 : 1) + r) / (a - r));
                },
                getDistance() {
                    return Math.abs(a - r);
                },
                getItemIn(u = !1) {
                    let d = this.getActives(), f = _o(o, ei(e || t, o, s));
                    if (u) {
                        const p = d;
                        d = f, f = p;
                    }
                    return f[xt(f, p => !v(d, p))];
                },
                getActives() {
                    return _o(o, ei(t || e, o, s));
                }
            };
        }
        function ei(t, e, i) {
            const s = Di(t, e);
            return i ? s - ml(t, e) : Math.min(s, Po(e));
        }
        function Po(t) {
            return Math.max(0, ke(t) - g(t).width);
        }
        function ke(t, e) {
            return jt(N(t).slice(0, e), i => g(i).width);
        }
        function ml(t, e) {
            return g(e).width / 2 - g(t).width / 2;
        }
        function Di(t, e) {
            return t && (is(t).left + (U ? g(t).width - g(e).width : 0)) * (U ? -1 : 1) || 0;
        }
        function _o(t, e) {
            e -= 1;
            const i = g(t).width, s = e + i + 2;
            return N(t).filter(n => {
                const o = Di(n, t), r = o + Math.min(g(n).width, i);
                return o >= e && r <= s;
            });
        }
        var vl = {
            mixins: [ st, ro, To, Eo, Co ],
            props: {
                center: Boolean,
                sets: Boolean,
                active: String
            },
            data: {
                center: !1,
                sets: !1,
                attrItem: "uk-slider-item",
                selList: ".uk-slider-items",
                selNav: ".uk-slider-nav",
                clsContainer: "uk-slider-container",
                active: "all",
                Transitioner: gl
            },
            computed: {
                finite({finite: t}) {
                    return t || bl(this.list, this.center);
                },
                maxIndex() {
                    if (!this.finite || this.center && !this.sets) return this.length - 1;
                    if (this.center) return Wt(this.sets);
                    let t = 0;
                    const e = Po(this.list), i = xt(this.slides, s => {
                        if (t >= e - .005) return !0;
                        t += g(s).width;
                    });
                    return ~i ? i : this.length - 1;
                },
                sets({sets: t}) {
                    if (!t || this.parallax) return;
                    let e = 0;
                    const i = [], s = g(this.list).width;
                    for (let n = 0; n < this.length; n++) {
                        const o = g(this.slides[n]).width;
                        e + o > s && (e = 0), this.center ? e < s / 2 && e + o + g(this.slides[rt(n + 1, this.slides)]).width / 2 > s / 2 && (i.push(n), 
                        e = s / 2 - o / 2) : e === 0 && i.push(Math.min(n, this.maxIndex)), e += o;
                    }
                    if (i.length) return i;
                },
                transitionOptions() {
                    return {
                        center: this.center,
                        list: this.list
                    };
                },
                slides() {
                    return N(this.list).filter(q);
                }
            },
            connected() {
                L(this.$el, this.clsContainer, !x(`.${this.clsContainer}`, this.$el));
            },
            observe: dt({
                target: ({slides: t, $el: e}) => [ e, ...t ]
            }),
            update: {
                write() {
                    for (const t of this.navItems) {
                        const e = $t(Z(t, this.attrItem));
                        e !== !1 && (t.hidden = !this.maxIndex || e > this.maxIndex || this.sets && !v(this.sets, e));
                    }
                    this.reorder(), this.parallax || this._translate(1), this.updateActiveClasses();
                },
                events: [ "resize" ]
            },
            events: {
                beforeitemshow(t) {
                    !this.dragging && this.sets && this.stack.length < 2 && !v(this.sets, this.index) && (this.index = this.getValidIndex());
                    const e = Math.abs(this.index - this.prevIndex + (this.dir > 0 && this.index < this.prevIndex || this.dir < 0 && this.index > this.prevIndex ? (this.maxIndex + 1) * this.dir : 0));
                    if (!this.dragging && e > 1) {
                        for (let n = 0; n < e; n++) this.stack.splice(1, 0, this.dir > 0 ? "next" : "previous");
                        t.preventDefault();
                        return;
                    }
                    const i = this.dir < 0 || !this.slides[this.prevIndex] ? this.index : this.prevIndex, s = ke(this.list) / this.length;
                    this.duration = ao(s / this.velocity) * (g(this.slides[i]).width / s), this.reorder();
                },
                itemshow() {
                    ~this.prevIndex && I(this._getTransitioner().getItemIn(), this.clsActive), this.updateActiveClasses(this.prevIndex);
                },
                itemshown() {
                    this.updateActiveClasses();
                }
            },
            methods: {
                reorder() {
                    if (this.finite) {
                        h(this.slides, "order", "");
                        return;
                    }
                    const t = this.dir > 0 && this.slides[this.prevIndex] ? this.prevIndex : this.index;
                    if (this.slides.forEach((n, o) => h(n, "order", this.dir > 0 && o < t ? 1 : this.dir < 0 && o >= this.index ? -1 : "")), 
                    !this.center || !this.length) return;
                    const e = this.slides[t];
                    let i = g(this.list).width / 2 - g(e).width / 2, s = 0;
                    for (;i > 0; ) {
                        const n = this.getIndex(--s + t, t), o = this.slides[n];
                        h(o, "order", n > t ? -2 : -1), i -= g(o).width;
                    }
                },
                updateActiveClasses(t = this.index) {
                    let e = this._getTransitioner(t).getActives();
                    this.active !== "all" && (e = [ this.slides[this.getValidIndex(t)] ]);
                    const i = [ this.clsActive, !this.sets || v(this.sets, S(this.index)) ? this.clsActivated : "" ];
                    for (const s of this.slides) {
                        const n = v(e, s);
                        L(s, i, n), s.ariaHidden = !n;
                        for (const o of D(de, s)) gt(o, "_tabindex") || (o._tabindex = o.tabIndex), o.tabIndex = n ? o._tabindex : -1;
                    }
                },
                getValidIndex(t = this.index, e = this.prevIndex) {
                    if (t = this.getIndex(t, e), !this.sets) return t;
                    let i;
                    do {
                        if (v(this.sets, t)) return t;
                        i = t, t = this.getIndex(t + this.dir, e);
                    } while (t !== i);
                    return t;
                },
                getAdjacentSlides() {
                    const {width: t} = g(this.list), e = -t, i = t * 2, s = g(this.slides[this.index]).width, n = this.center ? t / 2 - s / 2 : 0, o = new Set;
                    for (const r of [ -1, 1 ]) {
                        let a = n + (r > 0 ? s : 0), l = 0;
                        do {
                            const c = this.slides[this.getIndex(this.index + r + l++ * r)];
                            a += g(c).width * r, o.add(c);
                        } while (this.length > l && a > e && a < i);
                    }
                    return Array.from(o);
                },
                getIndexAt(t) {
                    let e = -1;
                    const i = this.center ? ke(this.list) - (g(this.slides[0]).width / 2 + g(Wt(this.slides)).width / 2) : ke(this.list, this.maxIndex);
                    let s = t * i, n = 0;
                    do {
                        const o = g(this.slides[++e]).width, r = this.center ? o / 2 + g(this.slides[e + 1]).width / 2 : o;
                        n = s / r % 1, s -= r;
                    } while (s >= 0 && e < this.maxIndex);
                    return [ e, n ];
                }
            }
        };
        function bl(t, e) {
            if (!t || t.length < 2) return !0;
            const {width: i} = g(t);
            if (!e) return Math.ceil(ke(t)) < Math.trunc(i + wl(t));
            const s = N(t), n = Math.trunc(i / 2);
            for (const o in s) {
                const r = s[o], a = g(r).width, l = new Set([ r ]);
                let c = 0;
                for (const u of [ -1, 1 ]) {
                    let d = a / 2, f = 0;
                    for (;d < n; ) {
                        const p = s[rt(+o + u + f++ * u, s)];
                        if (l.has(p)) return !0;
                        d += g(p).width, l.add(p);
                    }
                    c = Math.max(c, a / 2 + g(s[rt(+o + u, s)]).width / 2 - (d - n));
                }
                if (Math.trunc(c) > jt(s.filter(u => !l.has(u)), u => g(u).width)) return !0;
            }
            return !1;
        }
        function wl(t) {
            return Math.max(0, ...N(t).map(e => g(e).width));
        }
        var Ao = {
            mixins: [ vo ],
            beforeConnect() {
                this.item = this.$el.closest(`.${this.$options.id.replace("parallax", "items")} > *`);
            },
            disconnected() {
                this.item = null;
            },
            events: [ {
                name: "itemin itemout",
                self: !0,
                el: ({item: t}) => t,
                handler({type: t, detail: {percent: e, duration: i, timing: s, dir: n}}) {
                    Dt.read(() => {
                        if (!this.matchMedia) return;
                        const o = this.getCss(Mo(t, n, e)), r = this.getCss(Oo(t) ? .5 : n > 0 ? 1 : 0);
                        Dt.write(() => {
                            h(this.$el, o), M.start(this.$el, r, i, s).catch(A);
                        });
                    });
                }
            }, {
                name: "transitioncanceled transitionend",
                self: !0,
                el: ({item: t}) => t,
                handler() {
                    M.cancel(this.$el);
                }
            }, {
                name: "itemtranslatein itemtranslateout",
                self: !0,
                el: ({item: t}) => t,
                handler({type: t, detail: {percent: e, dir: i}}) {
                    Dt.read(() => {
                        if (!this.matchMedia) {
                            this.reset();
                            return;
                        }
                        const s = this.getCss(Mo(t, i, e));
                        Dt.write(() => h(this.$el, s));
                    });
                }
            } ]
        };
        function Oo(t) {
            return oe(t, "in");
        }
        function Mo(t, e, i) {
            return i /= 2, Oo(t) ^ e < 0 ? i : 1 - i;
        }
        var xl = {
            mixins: [ st, lo, To, Eo, Co ],
            props: {
                ratio: String,
                minHeight: String,
                maxHeight: String
            },
            data: {
                ratio: "16:9",
                minHeight: void 0,
                maxHeight: void 0,
                selList: ".uk-slideshow-items",
                attrItem: "uk-slideshow-item",
                selNav: ".uk-slideshow-nav",
                Animations: Za
            },
            watch: {
                list(t) {
                    h(t, {
                        aspectRatio: this.ratio ? this.ratio.replace(":", "/") : void 0,
                        minHeight: this.minHeight,
                        maxHeight: this.maxHeight,
                        width: "100%"
                    });
                }
            },
            methods: {
                getAdjacentSlides() {
                    return [ 1, -1 ].map(t => this.slides[this.getIndex(this.index + t)]);
                }
            }
        }, $l = {
            mixins: [ st, zn ],
            props: {
                group: String,
                threshold: Number,
                clsItem: String,
                clsPlaceholder: String,
                clsDrag: String,
                clsDragState: String,
                clsBase: String,
                clsNoDrag: String,
                clsEmpty: String,
                clsCustom: String,
                handle: String
            },
            data: {
                group: !1,
                threshold: 5,
                clsItem: "uk-sortable-item",
                clsPlaceholder: "uk-sortable-placeholder",
                clsDrag: "uk-sortable-drag",
                clsDragState: "uk-drag",
                clsBase: "uk-sortable",
                clsNoDrag: "uk-sortable-nodrag",
                clsEmpty: "uk-sortable-empty",
                clsCustom: "",
                handle: !1,
                pos: {}
            },
            events: {
                name: ut,
                passive: !1,
                handler(t) {
                    this.init(t);
                }
            },
            computed: {
                target: (t, e) => (e.tBodies || [ e ])[0],
                items() {
                    return N(this.target);
                },
                isEmpty() {
                    return !this.items.length;
                },
                handles({handle: t}, e) {
                    return t ? D(t, e) : this.items;
                }
            },
            watch: {
                isEmpty(t) {
                    L(this.target, this.clsEmpty, t);
                },
                handles(t, e) {
                    const i = {
                        touchAction: "none",
                        userSelect: "none"
                    };
                    St(e, i), h(t, i);
                }
            },
            update: {
                write(t) {
                    if (!this.drag || !O(this.placeholder)) return;
                    const {pos: {x: e, y: i}, origin: {offsetTop: s, offsetLeft: n}, placeholder: o} = this;
                    h(this.drag, {
                        top: i - s,
                        left: e - n
                    });
                    const r = this.getSortable(document.elementFromPoint(e, i));
                    if (!r) return;
                    const {items: a} = r;
                    if (a.some(M.inProgress)) return;
                    const l = Il(a, {
                        x: e,
                        y: i
                    });
                    if (a.length && (!l || l === o)) return;
                    const c = this.getSortable(o), u = El(r.target, l, o, e, i, r === c && t.moved !== l);
                    u !== !1 && (u && o === u || (r !== c ? (c.remove(o), t.moved = l) : delete t.moved, 
                    r.insert(o, u), this.touched.add(r)));
                },
                events: [ "move" ]
            },
            methods: {
                init(t) {
                    const {target: e, button: i, defaultPrevented: s} = t, [n] = this.items.filter(o => o.contains(e));
                    !n || s || i > 0 || ci(e) || e.closest(`.${this.clsNoDrag}`) || this.handle && !e.closest(this.handle) || (t.preventDefault(), 
                    this.pos = kt(t), this.touched = new Set([ this ]), this.placeholder = n, this.origin = {
                        target: e,
                        index: yt(n),
                        ...this.pos
                    }, w(document, Me, this.move), w(document, _t, this.end), this.threshold || this.start(t));
                },
                start(t) {
                    this.drag = Sl(this.$container, this.placeholder);
                    const {left: e, top: i} = g(this.placeholder);
                    ft(this.origin, {
                        offsetLeft: this.pos.x - e,
                        offsetTop: this.pos.y - i
                    }), I(this.drag, this.clsDrag, this.clsCustom), I(this.placeholder, this.clsPlaceholder), 
                    I(this.items, this.clsItem), I(document.documentElement, this.clsDragState), m(this.$el, "start", [ this, this.placeholder ]), 
                    yl(this.pos), this.move(t);
                },
                move: Cl(function(t) {
                    ft(this.pos, kt(t)), !this.drag && (Math.abs(this.pos.x - this.origin.x) > this.threshold || Math.abs(this.pos.y - this.origin.y) > this.threshold) && this.start(t), 
                    this.$emit("move");
                }),
                end() {
                    if (Yt(document, Me, this.move), Yt(document, _t, this.end), !this.drag) return;
                    kl();
                    const t = this.getSortable(this.placeholder);
                    this === t ? this.origin.index !== yt(this.placeholder) && m(this.$el, "moved", [ this, this.placeholder ]) : (m(t.$el, "added", [ t, this.placeholder ]), 
                    m(this.$el, "removed", [ this, this.placeholder ])), m(this.$el, "stop", [ this, this.placeholder ]), 
                    Q(this.drag), this.drag = null;
                    for (const {clsPlaceholder: e, clsItem: i} of this.touched) for (const s of this.touched) _(s.items, e, i);
                    this.touched = null, _(document.documentElement, this.clsDragState);
                },
                insert(t, e) {
                    I(this.items, this.clsItem), e && e.previousElementSibling !== t ? this.animate(() => pi(e, t)) : !e && this.target.lastElementChild !== t && this.animate(() => W(this.target, t));
                },
                remove(t) {
                    this.target.contains(t) && this.animate(() => Q(t));
                },
                getSortable(t) {
                    do {
                        const e = this.$getComponent(t, "sortable");
                        if (e && (e === this || this.group !== !1 && e.group === this.group)) return e;
                    } while (t = O(t));
                }
            }
        };
        let Do;
        function yl(t) {
            let e = Date.now();
            Do = setInterval(() => {
                let {x: i, y: s} = t;
                s += document.scrollingElement.scrollTop;
                const n = (Date.now() - e) * .3;
                e = Date.now(), Xt(document.elementFromPoint(i, t.y)).reverse().some(o => {
                    let {scrollTop: r, scrollHeight: a} = o;
                    const {top: l, bottom: c, height: u} = at(o);
                    if (l < s && l + 35 > s) r -= n; else if (c > s && c - 35 < s) r += n; else return;
                    if (r > 0 && r < a - u) return o.scrollTop = r, !0;
                });
            }, 15);
        }
        function kl() {
            clearInterval(Do);
        }
        function Sl(t, e) {
            let i;
            if (F(e, "li", "tr")) {
                i = x("<div>"), W(i, e.cloneNode(!0).children);
                for (const s of e.getAttributeNames()) k(i, s, e.getAttribute(s));
            } else i = e.cloneNode(!0);
            return W(t, i), h(i, "margin", "0", "important"), h(i, {
                boxSizing: "border-box",
                width: e.offsetWidth,
                height: e.offsetHeight,
                padding: h(e, "padding")
            }), tt(i.firstElementChild, tt(e.firstElementChild)), i;
        }
        function Il(t, e) {
            return t[xt(t, i => ai(e, g(i)))];
        }
        function El(t, e, i, s, n, o) {
            if (!N(t).length) return;
            const r = g(e);
            if (!o) return Tl(t, i) || n < r.top + r.height / 2 ? e : e.nextElementSibling;
            const a = g(i), l = Bo([ r.top, r.bottom ], [ a.top, a.bottom ]), [c, u, d, f] = l ? [ s, "width", "left", "right" ] : [ n, "height", "top", "bottom" ], p = a[u] < r[u] ? r[u] - a[u] : 0;
            return a[d] < r[d] ? p && c < r[d] + p ? !1 : e.nextElementSibling : p && c > r[f] - p ? !1 : e;
        }
        function Tl(t, e) {
            const i = N(t).length === 1;
            i && W(t, e);
            const s = N(t), n = s.some((o, r) => {
                const a = g(o);
                return s.slice(r + 1).some(l => {
                    const c = g(l);
                    return !Bo([ a.left, a.right ], [ c.left, c.right ]);
                });
            });
            return i && Q(e), n;
        }
        function Bo(t, e) {
            return t[1] > e[0] && e[1] > t[0];
        }
        function Cl(t) {
            let e;
            return function(...i) {
                e || (e = !0, t.call(this, ...i), requestAnimationFrame(() => e = !1));
            };
        }
        var Pl = {
            mixins: [ Xe, Kt, Rn ],
            data: {
                pos: "top",
                animation: [ "uk-animation-scale-up" ],
                duration: 100,
                cls: "uk-active"
            },
            connected() {
                _l(this.$el);
            },
            disconnected() {
                this.hide();
            },
            methods: {
                show() {
                    if (this.isToggled(this.tooltip || null)) return;
                    const {delay: t = 0, title: e} = Ol(this.$options);
                    if (!e) return;
                    const i = k(this.$el, "title"), s = w(this.$el, [ "blur", Ut ], o => !pt(o) && this.hide());
                    this.reset = () => {
                        k(this.$el, {
                            title: i,
                            "aria-describedby": null
                        }), s();
                    };
                    const n = te(this);
                    k(this.$el, {
                        title: null,
                        "aria-describedby": n
                    }), clearTimeout(this.showTimer), this.showTimer = setTimeout(() => this._show(e, n), t);
                },
                async hide() {
                    var t;
                    C(this.$el, "input:focus") || (clearTimeout(this.showTimer), this.isToggled(this.tooltip || null) && await this.toggleElement(this.tooltip, !1, !1), 
                    (t = this.reset) == null || t.call(this), Q(this.tooltip), this.tooltip = null);
                },
                async _show(t, e) {
                    this.tooltip = W(this.container, `<div id="${e}" class="uk-${this.$options.name}" role="tooltip"> <div class="uk-${this.$options.name}-inner">${t}</div> </div>`), 
                    w(this.tooltip, "toggled", (i, s) => {
                        if (!s) return;
                        const n = () => this.positionAt(this.tooltip, this.$el);
                        n();
                        const [o, r] = Al(this.tooltip, this.$el, this.pos);
                        this.origin = this.axis === "y" ? `${bi(o)}-${r}` : `${r}-${bi(o)}`;
                        const a = [ z(document, `keydown ${ut}`, this.hide, !1, l => l.type === ut && !this.$el.contains(l.target) || l.type === "keydown" && l.keyCode === B.ESC), w([ document, ...Jt(this.$el) ], "scroll", n, {
                            passive: !0
                        }) ];
                        z(this.tooltip, "hide", () => a.forEach(l => l()), {
                            self: !0
                        });
                    }), await this.toggleElement(this.tooltip, !0) || this.hide();
                }
            },
            events: {
                [`focus ${At} ${ut}`](t) {
                    (!pt(t) || t.type === ut) && document.readyState !== "loading" && this.show();
                }
            }
        };
        function _l(t) {
            Be(t) || (t.tabIndex = 0);
        }
        function Al(t, e, [i, s]) {
            const n = T(t), o = T(e), r = [ [ "left", "right" ], [ "top", "bottom" ] ];
            for (const l of r) {
                if (n[l[0]] >= o[l[1]]) {
                    i = l[1];
                    break;
                }
                if (n[l[1]] <= o[l[0]]) {
                    i = l[0];
                    break;
                }
            }
            return s = (v(r[0], i) ? r[1] : r[0]).find(l => n[l] === o[l]) || "center", [ i, s ];
        }
        function Ol(t) {
            const {el: e, id: i, data: s} = t;
            return [ "delay", "title" ].reduce((n, o) => ({
                [o]: Z(e, o),
                ...n
            }), {
                ...ve(Z(e, i), [ "title" ]),
                ...s
            });
        }
        var Ml = {
            mixins: [ Ei ],
            i18n: {
                invalidMime: "Invalid File Type: %s",
                invalidName: "Invalid File Name: %s",
                invalidSize: "Invalid File Size: %s Kilobytes Max"
            },
            props: {
                allow: String,
                clsDragover: String,
                concurrent: Number,
                maxSize: Number,
                method: String,
                mime: String,
                multiple: Boolean,
                name: String,
                params: Object,
                type: String,
                url: String
            },
            data: {
                allow: !1,
                clsDragover: "uk-dragover",
                concurrent: 1,
                maxSize: 0,
                method: "POST",
                mime: !1,
                multiple: !1,
                name: "files[]",
                params: {},
                type: "",
                url: "",
                abort: A,
                beforeAll: A,
                beforeSend: A,
                complete: A,
                completeAll: A,
                error: A,
                fail: A,
                load: A,
                loadEnd: A,
                loadStart: A,
                progress: A
            },
            events: {
                change(t) {
                    C(t.target, 'input[type="file"]') && (t.preventDefault(), t.target.files && this.upload(t.target.files), 
                    t.target.value = "");
                },
                drop(t) {
                    Bi(t);
                    const e = t.dataTransfer;
                    e != null && e.files && (_(this.$el, this.clsDragover), this.upload(e.files));
                },
                dragenter(t) {
                    Bi(t);
                },
                dragover(t) {
                    Bi(t), I(this.$el, this.clsDragover);
                },
                dragleave(t) {
                    Bi(t), _(this.$el, this.clsDragover);
                }
            },
            methods: {
                async upload(t) {
                    if (t = re(t), !t.length) return;
                    m(this.$el, "upload", [ t ]);
                    for (const s of t) {
                        if (this.maxSize && this.maxSize * 1e3 < s.size) {
                            this.fail(this.t("invalidSize", this.maxSize));
                            return;
                        }
                        if (this.allow && !No(this.allow, s.name)) {
                            this.fail(this.t("invalidName", this.allow));
                            return;
                        }
                        if (this.mime && !No(this.mime, s.type)) {
                            this.fail(this.t("invalidMime", this.mime));
                            return;
                        }
                    }
                    this.multiple || (t = t.slice(0, 1)), this.beforeAll(this, t);
                    const e = Dl(t, this.concurrent), i = async s => {
                        const n = new FormData;
                        s.forEach(o => n.append(this.name, o));
                        for (const o in this.params) n.append(o, this.params[o]);
                        try {
                            const o = await Bl(this.url, {
                                data: n,
                                method: this.method,
                                responseType: this.type,
                                beforeSend: r => {
                                    const {xhr: a} = r;
                                    w(a.upload, "progress", this.progress);
                                    for (const l of [ "loadStart", "load", "loadEnd", "abort" ]) w(a, l.toLowerCase(), this[l]);
                                    return this.beforeSend(r);
                                }
                            });
                            this.complete(o), e.length ? await i(e.shift()) : this.completeAll(o);
                        } catch (o) {
                            this.error(o);
                        }
                    };
                    await i(e.shift());
                }
            }
        };
        function No(t, e) {
            return e.match(new RegExp(`^${t.replace(/\//g, "\\/").replace(/\*\*/g, "(\\/[^\\/]+)*").replace(/\*/g, "[^\\/]+").replace(/((?!\\))\?/g, "$1.")}$`, "i"));
        }
        function Dl(t, e) {
            const i = [];
            for (let s = 0; s < t.length; s += e) i.push(t.slice(s, s + e));
            return i;
        }
        function Bi(t) {
            t.preventDefault(), t.stopPropagation();
        }
        async function Bl(t, e) {
            const i = {
                data: null,
                method: "GET",
                headers: {},
                xhr: new XMLHttpRequest,
                beforeSend: A,
                responseType: "",
                ...e
            };
            return await i.beforeSend(i), Nl(t, i);
        }
        function Nl(t, e) {
            return new Promise((i, s) => {
                const {xhr: n} = e;
                for (const o in e) if (o in n) try {
                    n[o] = e[o];
                } catch {}
                n.open(e.method.toUpperCase(), t);
                for (const o in e.headers) n.setRequestHeader(o, e.headers[o]);
                w(n, "load", () => {
                    n.status === 0 || n.status >= 200 && n.status < 300 || n.status === 304 ? i(n) : s(ft(Error(n.statusText), {
                        xhr: n,
                        status: n.status
                    }));
                }), w(n, "error", () => s(ft(Error("Network Error"), {
                    xhr: n
                }))), w(n, "timeout", () => s(ft(Error("Network Timeout"), {
                    xhr: n
                }))), n.send(e.data);
            });
        }
        var zl = Object.freeze({
            __proto__: null,
            Countdown: Yr,
            Filter: oa,
            Lightbox: el,
            LightboxPanel: co,
            Notification: nl,
            Parallax: fl,
            Slider: vl,
            SliderParallax: Ao,
            Slideshow: xl,
            SlideshowParallax: Ao,
            Sortable: $l,
            Tooltip: Pl,
            Upload: Ml
        });
        function Fl(t) {
            qt && window.MutationObserver && (document.body ? requestAnimationFrame(() => zo(t)) : new MutationObserver((e, i) => {
                document.body && (zo(t), i.disconnect());
            }).observe(document.documentElement, {
                childList: !0
            }));
        }
        function zo(t) {
            m(document, "uikit:init", t), document.body && Mt(document.body, Fo), new MutationObserver(Hl).observe(document, {
                subtree: !0,
                childList: !0,
                attributes: !0
            }), t._initialized = !0;
        }
        function Hl(t) {
            var e;
            for (const {addedNodes: i, removedNodes: s, target: n, attributeName: o} of t) {
                for (const a of i) Mt(a, Fo);
                for (const a of s) Mt(a, Ll);
                const r = o && Ho(o);
                r && (Pt(n, o) ? Ke(r, n) : (e = Ci(n, r)) == null || e.$destroy());
            }
        }
        function Fo(t) {
            const e = Ze(t);
            for (const i in e) Os(e[i]);
            for (const i of t.getAttributeNames()) {
                const s = Ho(i);
                s && Ke(s, t);
            }
        }
        function Ll(t) {
            const e = Ze(t);
            for (const i in e) Ms(e[i]);
        }
        function Ho(t) {
            wt(t, "data-") && (t = t.slice(5));
            const e = xe[t];
            return e && (e.options || e).name;
        }
        Ua(ht), Va(ht);
        var Lo = {
            mixins: [ st, Kt ],
            props: {
                animation: Boolean,
                targets: String,
                active: null,
                collapsible: Boolean,
                multiple: Boolean,
                toggle: String,
                content: String,
                offset: Number
            },
            data: {
                targets: "> *",
                active: !1,
                animation: !0,
                collapsible: !0,
                multiple: !1,
                clsOpen: "uk-open",
                toggle: "> .uk-accordion-title",
                content: "> .uk-accordion-content",
                offset: 0
            },
            computed: {
                items: ({targets: t}, e) => D(t, e),
                toggles({toggle: t}) {
                    return this.items.map(e => x(t, e));
                },
                contents({content: t}) {
                    return this.items.map(e => {
                        var i;
                        return ((i = e._wrapper) == null ? void 0 : i.firstElementChild) || x(t, e);
                    });
                }
            },
            watch: {
                items(t, e) {
                    if (e || $(t, this.clsOpen)) return;
                    const i = this.active !== !1 && t[Number(this.active)] || !this.collapsible && t[0];
                    i && this.toggle(i, !1);
                },
                toggles() {
                    this.$emit();
                },
                contents(t) {
                    for (const e of t) {
                        const i = $(this.items.find(s => s.contains(e)), this.clsOpen);
                        Ni(e, !i);
                    }
                    this.$emit();
                }
            },
            observe: Ii(),
            events: [ {
                name: "click keydown",
                delegate: ({targets: t, $props: e}) => `${t} ${e.toggle}`,
                async handler(t) {
                    var e;
                    t.type === "keydown" && t.keyCode !== B.SPACE || (Et(t), (e = this._off) == null || e.call(this), 
                    this._off = jl(t.target), await this.toggle(yt(this.toggles, t.current)), this._off());
                }
            }, {
                name: "shown hidden",
                self: !0,
                delegate: ({targets: t}) => t,
                handler() {
                    this.$emit();
                }
            } ],
            update() {
                const t = Ne(this.items, `.${this.clsOpen}`);
                for (const e in this.items) {
                    const i = this.toggles[e], s = this.contents[e];
                    if (!i || !s) continue;
                    i.id = te(this, i), s.id = te(this, s);
                    const n = v(t, this.items[e]);
                    k(i, {
                        role: F(i, "a") ? "button" : null,
                        "aria-controls": s.id,
                        "aria-expanded": n,
                        "aria-disabled": !this.collapsible && t.length < 2 && n
                    }), k(s, {
                        role: "region",
                        "aria-labelledby": i.id
                    }), F(s, "ul") && k(N(s), "role", "presentation");
                }
            },
            methods: {
                toggle(t, e) {
                    t = this.items[rt(t, this.items)];
                    let i = [ t ];
                    const s = Ne(this.items, `.${this.clsOpen}`);
                    if (!this.multiple && !v(s, i[0]) && (i = i.concat(s)), !(!this.collapsible && s.length < 2 && v(s, t))) return Promise.all(i.map(n => this.toggleElement(n, !v(s, n), (o, r) => {
                        if (L(o, this.clsOpen, r), e === !1 || !this.animation) {
                            Ni(x(this.content, o), !r);
                            return;
                        }
                        return Wl(o, r, this);
                    })));
                }
            }
        };
        function Ni(t, e) {
            t && (t.hidden = e);
        }
        async function Wl(t, e, {content: i, duration: s, velocity: n, transition: o}) {
            var r;
            i = ((r = t._wrapper) == null ? void 0 : r.firstElementChild) || x(i, t), t._wrapper || (t._wrapper = Le(i, "<div>"));
            const a = t._wrapper;
            h(a, "overflow", "hidden");
            const l = S(h(a, "height"));
            await M.cancel(a), Ni(i, !1);
            const c = jt([ "marginTop", "marginBottom" ], d => h(i, d)) + g(i).height, u = l / c;
            s = (n * c + s) * (e ? 1 - u : u), h(a, "height", l), await M.start(a, {
                height: e ? c : 0
            }, s, o), We(i), delete t._wrapper, e || Ni(i, !0);
        }
        function jl(t) {
            const e = Bt(t, !0);
            let i;
            return function s() {
                i = requestAnimationFrame(() => {
                    const {top: n} = g(t);
                    n < 0 && (e.scrollTop += n), s();
                });
            }(), () => requestAnimationFrame(() => cancelAnimationFrame(i));
        }
        var Rl = {
            mixins: [ st, Kt ],
            args: "animation",
            props: {
                animation: Boolean,
                close: String
            },
            data: {
                animation: !0,
                selClose: ".uk-alert-close",
                duration: 150
            },
            events: {
                name: "click",
                delegate: ({selClose: t}) => t,
                handler(t) {
                    Et(t), this.close();
                }
            },
            methods: {
                async close() {
                    await this.toggleElement(this.$el, !1, ql), this.$destroy(!0);
                }
            }
        };
        function ql(t, e, {duration: i, transition: s, velocity: n}) {
            const o = S(h(t, "height"));
            return h(t, "height", o), M.start(t, {
                height: 0,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0,
                borderTop: 0,
                borderBottom: 0,
                opacity: 0
            }, n * o + i, s);
        }
        var Wo = {
            args: "autoplay",
            props: {
                automute: Boolean,
                autoplay: Boolean
            },
            data: {
                automute: !1,
                autoplay: !0
            },
            beforeConnect() {
                this.autoplay === "inview" && !Pt(this.$el, "preload") && (this.$el.preload = "none"), 
                F(this.$el, "iframe") && !Pt(this.$el, "allow") && (this.$el.allow = "autoplay"), 
                this.autoplay === "hover" && (F(this.$el, "video") ? this.$el.tabIndex = 0 : this.autoplay = !0), 
                this.automute && pn(this.$el);
            },
            events: [ {
                name: `${At} focusin`,
                filter: ({autoplay: t}) => v(t, "hover"),
                handler(t) {
                    !pt(t) || !Ul(this.$el) ? as(this.$el) : $i(this.$el);
                }
            }, {
                name: `${Ut} focusout`,
                filter: ({autoplay: t}) => v(t, "hover"),
                handler(t) {
                    pt(t) || $i(this.$el);
                }
            } ],
            observe: [ be({
                filter: ({autoplay: t}) => t !== "hover",
                handler([{isIntersecting: t}]) {
                    document.fullscreenElement || (t ? this.autoplay && as(this.$el) : $i(this.$el));
                },
                args: {
                    intersecting: !1
                },
                options: ({$el: t, autoplay: e}) => ({
                    root: e === "inview" ? null : O(t).closest(":not(a)")
                })
            }) ]
        };
        function Ul(t) {
            return !t.paused && !t.ended;
        }
        var Vl = {
            mixins: [ Wo ],
            props: {
                width: Number,
                height: Number
            },
            data: {
                automute: !0
            },
            created() {
                this.useObjectFit = F(this.$el, "img", "video");
            },
            observe: dt({
                target: ({$el: t}) => jo(t) || O(t),
                filter: ({useObjectFit: t}) => !t
            }),
            update: {
                read() {
                    if (this.useObjectFit) return !1;
                    const {$el: t, width: e = t.clientWidth, height: i = t.clientHeight} = this, s = jo(t) || O(t), n = Ui.cover({
                        width: e,
                        height: i
                    }, {
                        width: s.offsetWidth,
                        height: s.offsetHeight
                    });
                    return n.width && n.height ? n : !1;
                },
                write({height: t, width: e}) {
                    h(this.$el, {
                        height: t,
                        width: e
                    });
                },
                events: [ "resize" ]
            }
        };
        function jo(t) {
            for (;t = O(t); ) if (h(t, "position") !== "static") return t;
        }
        let Y;
        var Ro = {
            mixins: [ Xe, Rn, Kt ],
            args: "pos",
            props: {
                mode: "list",
                toggle: Boolean,
                boundary: Boolean,
                boundaryX: Boolean,
                boundaryY: Boolean,
                target: Boolean,
                targetX: Boolean,
                targetY: Boolean,
                stretch: Boolean,
                delayShow: Number,
                delayHide: Number,
                autoUpdate: Boolean,
                clsDrop: String,
                animateOut: Boolean,
                bgScroll: Boolean,
                closeOnScroll: Boolean
            },
            data: {
                mode: [ "click", "hover" ],
                toggle: "- *",
                boundary: !1,
                boundaryX: !1,
                boundaryY: !1,
                target: !1,
                targetX: !1,
                targetY: !1,
                stretch: !1,
                delayShow: 0,
                delayHide: 800,
                autoUpdate: !0,
                clsDrop: !1,
                animateOut: !1,
                bgScroll: !0,
                animation: [ "uk-animation-fade" ],
                cls: "uk-open",
                container: !1,
                closeOnScroll: !1,
                selClose: ".uk-drop-close"
            },
            computed: {
                boundary({boundary: t, boundaryX: e, boundaryY: i}, s) {
                    return [ et(e || t, s) || window, et(i || t, s) || window ];
                },
                target({target: t, targetX: e, targetY: i}, s) {
                    return e || (e = t || this.targetEl), i || (i = t || this.targetEl), [ e === !0 ? window : et(e, s), i === !0 ? window : et(i, s) ];
                }
            },
            created() {
                this.tracker = new un;
            },
            beforeConnect() {
                this.clsDrop = this.$props.clsDrop || this.$options.id;
            },
            connected() {
                I(this.$el, "uk-drop", this.clsDrop), this.toggle && !this.targetEl && (this.targetEl = Gl(this)), 
                k(this.targetEl, "aria-expanded", !1), this._style = oi(this.$el.style, [ "width", "height" ]);
            },
            disconnected() {
                this.isActive() && (this.hide(!1), Y = null), h(this.$el, this._style);
            },
            events: [ {
                name: "click",
                delegate: ({selClose: t}) => t,
                handler(t) {
                    Et(t), this.hide(!1);
                }
            }, {
                name: "click",
                delegate: () => 'a[href*="#"]',
                handler({defaultPrevented: t, current: e}) {
                    const {hash: i} = e;
                    !t && i && Vt(e) && !this.$el.contains(x(i)) && this.hide(!1);
                }
            }, {
                name: "beforescroll",
                handler() {
                    this.hide(!1);
                }
            }, {
                name: "toggle",
                self: !0,
                handler(t, e) {
                    t.preventDefault(), this.isToggled() ? this.hide(!1) : this.show(e == null ? void 0 : e.$el, !1);
                }
            }, {
                name: "toggleshow",
                self: !0,
                handler(t, e) {
                    t.preventDefault(), this.show(e == null ? void 0 : e.$el);
                }
            }, {
                name: "togglehide",
                self: !0,
                handler(t) {
                    t.preventDefault(), C(this.$el, ":focus,:hover") || this.hide();
                }
            }, {
                name: `${At} focusin`,
                filter: ({mode: t}) => v(t, "hover"),
                handler(t) {
                    pt(t) || this.clearTimers();
                }
            }, {
                name: `${Ut} focusout`,
                filter: ({mode: t}) => v(t, "hover"),
                handler(t) {
                    !pt(t) && t.relatedTarget && this.hide();
                }
            }, {
                name: "toggled",
                self: !0,
                handler(t, e) {
                    e && (this.clearTimers(), this.position());
                }
            }, {
                name: "show",
                self: !0,
                handler() {
                    Y = this, this.tracker.init(), k(this.targetEl, "aria-expanded", !0);
                    const t = [ Xl(this), Jl(this), Zl(this), this.autoUpdate && qo(this), this.closeOnScroll && Kl(this) ];
                    z(this.$el, "hide", () => t.forEach(e => e && e()), {
                        self: !0
                    }), this.bgScroll || z(this.$el, "hidden", jn(this.$el), {
                        self: !0
                    });
                }
            }, {
                name: "beforehide",
                self: !0,
                handler() {
                    this.clearTimers();
                }
            }, {
                name: "hide",
                handler({target: t}) {
                    if (this.$el !== t) {
                        Y = Y === null && this.$el.contains(t) && this.isToggled() ? this : Y;
                        return;
                    }
                    Y = this.isActive() ? null : Y, this.tracker.cancel(), k(this.targetEl, "aria-expanded", !1);
                }
            } ],
            update: {
                write() {
                    this.isToggled() && !$(this.$el, this.clsEnter) && this.position();
                }
            },
            methods: {
                show(t = this.targetEl, e = !0) {
                    if (this.isToggled() && t && this.targetEl && t !== this.targetEl && this.hide(!1, !1), 
                    this.targetEl = t, this.clearTimers(), !this.isActive()) {
                        if (Y) {
                            if (e && Y.isDelaying()) {
                                this.showTimer = setTimeout(() => C(t, ":hover") && this.show(), 10);
                                return;
                            }
                            let i;
                            for (;Y && i !== Y && !Y.$el.contains(this.$el); ) i = Y, Y.hide(!1, !1);
                        }
                        this.container && O(this.$el) !== this.container && W(this.container, this.$el), 
                        this.showTimer = setTimeout(() => this.toggleElement(this.$el, !0), e && this.delayShow || 0);
                    }
                },
                hide(t = !0, e = !0) {
                    const i = () => this.toggleElement(this.$el, !1, this.animateOut && e);
                    this.clearTimers(), this.isDelayedHide = t, t && this.isDelaying() ? this.hideTimer = setTimeout(this.hide, 50) : t && this.delayHide ? this.hideTimer = setTimeout(i, this.delayHide) : i();
                },
                clearTimers() {
                    clearTimeout(this.showTimer), clearTimeout(this.hideTimer), this.showTimer = null, 
                    this.hideTimer = null;
                },
                isActive() {
                    return Y === this;
                },
                isDelaying() {
                    return [ this.$el, ...D(".uk-drop", this.$el) ].some(t => this.tracker.movesTo(t));
                },
                position() {
                    const t = Cs(this.$el);
                    _(this.$el, "uk-drop-stack"), h(this.$el, this._style), this.$el.hidden = !0;
                    const e = this.target.map(o => Yl(this.$el, o)), i = this.getViewportOffset(this.$el), s = [ [ 0, [ "x", "width", "left", "right" ] ], [ 1, [ "y", "height", "top", "bottom" ] ] ];
                    for (const [o, [r, a]] of s) this.axis !== r && v([ r, !0 ], this.stretch) && h(this.$el, {
                        [a]: Math.min(T(this.boundary[o])[a], e[o][a] - 2 * i),
                        [`overflow-${r}`]: "auto"
                    });
                    const n = e[0].width - 2 * i;
                    this.$el.hidden = !1, h(this.$el, "maxWidth", ""), this.$el.offsetWidth > n && I(this.$el, "uk-drop-stack"), 
                    h(this.$el, "maxWidth", n), this.positionAt(this.$el, this.target, this.boundary);
                    for (const [o, [r, a, l, c]] of s) if (this.axis === r && v([ r, !0 ], this.stretch)) {
                        const u = Math.abs(this.getPositionOffset()), d = T(this.target[o]), f = T(this.$el);
                        h(this.$el, {
                            [a]: (d[l] > f[l] ? d[this.inset ? c : l] - Math.max(T(this.boundary[o])[l], e[o][l] + i) : Math.min(T(this.boundary[o])[c], e[o][c] - i) - d[this.inset ? l : c]) - u,
                            [`overflow-${r}`]: "auto"
                        }), this.positionAt(this.$el, this.target, this.boundary);
                    }
                    t();
                }
            }
        };
        function Yl(t, e) {
            return at(Jt(e).find(i => i.contains(t)));
        }
        function Gl(t) {
            const {$el: e} = t.$create("toggle", et(t.toggle, t.$el), {
                target: t.$el,
                mode: t.mode
            });
            return e.ariaHasPopup = !0, e;
        }
        function Xl(t) {
            const e = () => t.$emit(), i = [ os(e), qe(Jt(t.$el).concat(t.target), e) ];
            return () => i.map(s => s.disconnect());
        }
        function qo(t, e = () => t.$emit()) {
            return w([ document, ...Jt(t.$el) ], "scroll", e, {
                passive: !0
            });
        }
        function Jl(t) {
            return w(document, "keydown", e => {
                e.keyCode === B.ESC && t.hide(!1);
            });
        }
        function Kl(t) {
            return qo(t, () => t.hide(!1));
        }
        function Zl(t) {
            return w(document, ut, ({target: e}) => {
                t.$el.contains(e) || z(document, `${_t} ${hi} scroll`, ({defaultPrevented: i, type: s, target: n}) => {
                    var o;
                    !i && s === _t && e === n && !((o = t.targetEl) != null && o.contains(e)) && t.hide(!1);
                }, !0);
            });
        }
        var Uo = {
            mixins: [ st, Xe ],
            props: {
                align: String,
                clsDrop: String,
                boundary: Boolean,
                dropbar: Boolean,
                dropbarAnchor: Boolean,
                duration: Number,
                mode: Boolean,
                offset: Boolean,
                stretch: Boolean,
                delayShow: Boolean,
                delayHide: Boolean,
                target: Boolean,
                targetX: Boolean,
                targetY: Boolean,
                animation: Boolean,
                animateOut: Boolean,
                closeOnScroll: Boolean
            },
            data: {
                align: U ? "right" : "left",
                clsDrop: "uk-dropdown",
                clsDropbar: "uk-dropnav-dropbar",
                boundary: !0,
                dropbar: !1,
                dropbarAnchor: !1,
                delayShow: 160,
                duration: 200,
                container: !1,
                selNavItem: "> li > a, > ul > li > a"
            },
            computed: {
                dropbarAnchor: ({dropbarAnchor: t}, e) => et(t, e) || e,
                dropbar({dropbar: t}) {
                    return t ? (t = this._dropbar || et(t, this.$el) || x(`+ .${this.clsDropbar}`, this.$el), 
                    t || (this._dropbar = x("<div></div>"))) : null;
                },
                dropContainer(t, e) {
                    return this.container || e;
                },
                dropdowns({clsDrop: t}, e) {
                    var i;
                    const s = D(`.${t}`, e);
                    if (this.dropContainer !== e) for (const n of D(`.${t}`, this.dropContainer)) {
                        const o = (i = this.getDropdown(n)) == null ? void 0 : i.targetEl;
                        !v(s, n) && o && this.$el.contains(o) && s.push(n);
                    }
                    return s;
                },
                items({selNavItem: t}, e) {
                    return D(t, e);
                }
            },
            watch: {
                dropbar(t) {
                    I(t, "uk-dropbar", "uk-dropbar-top", this.clsDropbar, `uk-${this.$options.name}-dropbar`);
                },
                dropdowns() {
                    this.initializeDropdowns();
                }
            },
            connected() {
                this.initializeDropdowns(), Ql(this.$el);
            },
            disconnected() {
                Q(this._dropbar), delete this._dropbar;
            },
            events: [ {
                name: "mouseover focusin",
                delegate: ({selNavItem: t}) => t,
                handler({current: t}) {
                    const e = this.getActive();
                    e && v(e.mode, "hover") && e.targetEl && !t.contains(e.targetEl) && !e.isDelaying() && e.hide(!1);
                }
            }, {
                name: "keydown",
                self: !0,
                delegate: ({selNavItem: t}) => t,
                handler(t) {
                    var e;
                    const {current: i, keyCode: s} = t, n = this.getActive();
                    if (s === B.DOWN) if ((n == null ? void 0 : n.targetEl) === i) t.preventDefault(), 
                    (e = x(de, n.$el)) == null || e.focus(); else {
                        const o = this.dropdowns.find(r => {
                            var a;
                            return ((a = this.getDropdown(r)) == null ? void 0 : a.targetEl) === i;
                        });
                        o && (t.preventDefault(), i.click(), z(o, "show", r => {
                            var a;
                            return (a = x(de, r.target)) == null ? void 0 : a.focus();
                        }));
                    }
                    Vo(t, this.items, n);
                }
            }, {
                name: "keydown",
                el: ({dropContainer: t}) => t,
                delegate: ({clsDrop: t}) => `.${t}`,
                handler(t) {
                    var e;
                    const {current: i, keyCode: s, target: n} = t;
                    if (ci(n) || !v(this.dropdowns, i)) return;
                    const o = this.getActive();
                    let r = -1;
                    if (s === B.HOME ? r = 0 : s === B.END ? r = "last" : s === B.UP ? r = "previous" : s === B.DOWN ? r = "next" : s === B.ESC && ((e = o.targetEl) == null || e.focus()), 
                    ~r) {
                        t.preventDefault();
                        const a = D(de, i);
                        a[rt(r, a, xt(a, l => C(l, ":focus")))].focus();
                        return;
                    }
                    Vo(t, this.items, o);
                }
            }, {
                name: "mouseleave",
                el: ({dropbar: t}) => t,
                filter: ({dropbar: t}) => t,
                handler() {
                    const t = this.getActive();
                    t && v(t.mode, "hover") && !this.dropdowns.some(e => C(e, ":hover")) && t.hide();
                }
            }, {
                name: "beforeshow",
                el: ({dropContainer: t}) => t,
                filter: ({dropbar: t}) => t,
                handler({target: t}) {
                    this.isDropbarDrop(t) && (this.dropbar.previousElementSibling !== this.dropbarAnchor && gi(this.dropbarAnchor, this.dropbar), 
                    I(t, `${this.clsDrop}-dropbar`));
                }
            }, {
                name: "show",
                el: ({dropContainer: t}) => t,
                filter: ({dropbar: t}) => t,
                handler({target: t}) {
                    if (!this.isDropbarDrop(t)) return;
                    const e = this.getDropdown(t), i = () => {
                        const s = Math.max(...fe(t, `.${this.clsDrop}`).concat(t).map(n => T(n).bottom));
                        T(this.dropbar, {
                            left: T(this.dropbar).left,
                            top: this.getDropbarOffset(e.getPositionOffset())
                        }), this.transitionTo(s - T(this.dropbar).top + S(h(t, "marginBottom")), t);
                    };
                    this._observer = qe([ e.$el, ...e.target ], i), i();
                }
            }, {
                name: "beforehide",
                el: ({dropContainer: t}) => t,
                filter: ({dropbar: t}) => t,
                handler(t) {
                    const e = this.getActive();
                    C(this.dropbar, ":hover") && e.$el === t.target && this.isDropbarDrop(e.$el) && v(e.mode, "hover") && e.isDelayedHide && !this.items.some(i => e.targetEl !== i && C(i, ":focus")) && t.preventDefault();
                }
            }, {
                name: "hide",
                el: ({dropContainer: t}) => t,
                filter: ({dropbar: t}) => t,
                handler({target: t}) {
                    var e;
                    if (!this.isDropbarDrop(t)) return;
                    (e = this._observer) == null || e.disconnect();
                    const i = this.getActive();
                    (!i || i.$el === t) && this.transitionTo(0);
                }
            } ],
            methods: {
                getActive() {
                    var t;
                    return v(this.dropdowns, (t = Y) == null ? void 0 : t.$el) && Y;
                },
                async transitionTo(t, e) {
                    const {dropbar: i} = this, s = tt(i);
                    if (e = s < t && e, await M.cancel([ e, i ]), e) {
                        const n = T(e).top - T(i).top - s;
                        n > 0 && h(e, "transitionDelay", `${n / t * this.duration}ms`);
                    }
                    h(e, "clipPath", `polygon(0 0,100% 0,100% ${s}px,0 ${s}px)`), tt(i, s), await Promise.all([ M.start(i, {
                        height: t
                    }, this.duration), M.start(e, {
                        clipPath: `polygon(0 0,100% 0,100% ${t}px,0 ${t}px)`
                    }, this.duration).finally(() => h(e, {
                        clipPath: "",
                        transitionDelay: ""
                    })) ]).catch(A);
                },
                getDropdown(t) {
                    return this.$getComponent(t, "drop") || this.$getComponent(t, "dropdown");
                },
                isDropbarDrop(t) {
                    return v(this.dropdowns, t) && $(t, this.clsDrop);
                },
                getDropbarOffset(t) {
                    const {$el: e, target: i, targetY: s} = this, {top: n, height: o} = T(et(s || i || e, e));
                    return n + o + t;
                },
                initializeDropdowns() {
                    this.$create("drop", this.dropdowns.filter(t => !this.getDropdown(t)), {
                        ...this.$props,
                        flip: !1,
                        shift: !0,
                        pos: `bottom-${this.align}`,
                        boundary: this.boundary === !0 ? this.$el : this.boundary
                    });
                }
            }
        };
        function Vo(t, e, i) {
            var s, n, o;
            const {current: r, keyCode: a} = t;
            let l = -1;
            a === B.HOME ? l = 0 : a === B.END ? l = "last" : a === B.LEFT ? l = "previous" : a === B.RIGHT ? l = "next" : a === B.TAB && ((s = i.targetEl) == null || s.focus(), 
            (n = i.hide) == null || n.call(i, !1)), ~l && (t.preventDefault(), (o = i.hide) == null || o.call(i, !1), 
            e[rt(l, e, e.indexOf(i.targetEl || r))].focus());
        }
        function Ql(t) {
            const e = () => i.forEach(s => s()), i = [ z(t.ownerDocument, Me, s => t.contains(s.target) || e()), w(t, `mouseenter ${At}`, s => s.stopPropagation(), {
                capture: !0
            }), w(t, `mouseleave ${Ut}`, e, {
                capture: !0
            }) ];
        }
        var th = {
            mixins: [ st ],
            args: "target",
            props: {
                target: Boolean
            },
            data: {
                target: !1
            },
            computed: {
                input: (t, e) => x(De, e),
                state() {
                    return this.input.nextElementSibling;
                },
                target({target: t}, e) {
                    return t && (t === !0 && O(this.input) === e && this.input.nextElementSibling || x(t, e));
                }
            },
            update() {
                var t;
                const {target: e, input: i} = this;
                if (!e) return;
                let s;
                const n = ci(e) ? "value" : "textContent", o = e[n], r = (t = i.files) != null && t[0] ? i.files[0].name : C(i, "select") && (s = D("option", i).filter(a => a.selected)[0]) ? s.textContent : i.value;
                o !== r && (e[n] = r);
            },
            events: [ {
                name: "change",
                handler() {
                    this.$emit();
                }
            }, {
                name: "reset",
                el: ({$el: t}) => t.closest("form"),
                handler() {
                    this.$emit();
                }
            } ]
        }, eh = {
            extends: _n,
            mixins: [ st ],
            name: "grid",
            props: {
                masonry: Boolean,
                parallax: String,
                parallaxStart: String,
                parallaxEnd: String,
                parallaxJustify: Boolean
            },
            data: {
                margin: "uk-grid-margin",
                clsStack: "uk-grid-stack",
                masonry: !1,
                parallax: 0,
                parallaxStart: 0,
                parallaxEnd: 0,
                parallaxJustify: !1
            },
            connected() {
                this.masonry && I(this.$el, "uk-flex-top", "uk-flex-wrap-top");
            },
            observe: Ye({
                filter: ({parallax: t, parallaxJustify: e}) => t || e
            }),
            update: [ {
                write({rows: t}) {
                    L(this.$el, this.clsStack, !t.some(e => e.length > 1));
                },
                events: [ "resize" ]
            }, {
                read(t) {
                    const {rows: e} = t;
                    let {masonry: i, parallax: s, parallaxJustify: n, margin: o} = this;
                    if (s = Math.max(0, G(s)), !(i || s || n) || Yo(e) || e[0].some((b, y) => e.some(P => P[y] && P[y].offsetWidth !== b.offsetWidth))) return t.translates = t.scrollColumns = !1;
                    let a, l, r = sh(e, o);
                    i ? [a, l] = ih(e, r, i === "next") : a = nh(e);
                    const c = a.map(b => jt(b, "offsetHeight") + r * (b.length - 1)), u = Math.max(0, ...c);
                    let d, f, p;
                    return (s || n) && (d = c.map((b, y) => n ? u - b + s : s / (y % 2 || 8)), n || (s = Math.max(...c.map((b, y) => b + d[y] - u))), 
                    f = G(this.parallaxStart, "height", this.$el, !0), p = G(this.parallaxEnd, "height", this.$el, !0)), 
                    {
                        columns: a,
                        translates: l,
                        scrollColumns: d,
                        parallaxStart: f,
                        parallaxEnd: p,
                        padding: s,
                        height: l ? u : ""
                    };
                },
                write({height: t, padding: e}) {
                    h(this.$el, "paddingBottom", e || ""), t !== !1 && h(this.$el, "height", t);
                },
                events: [ "resize" ]
            }, {
                read({rows: t, scrollColumns: e, parallaxStart: i, parallaxEnd: s}) {
                    return {
                        scrolled: e && !Yo(t) ? yi(this.$el, i, s) : !1
                    };
                },
                write({columns: t, scrolled: e, scrollColumns: i, translates: s}) {
                    !e && !s || t.forEach((n, o) => n.forEach((r, a) => {
                        let [l, c] = s && s[o][a] || [ 0, 0 ];
                        e && (c += e * i[o]), h(r, "transform", `translate(${l}px, ${c}px)`);
                    }));
                },
                events: [ "scroll", "resize" ]
            } ]
        };
        function Yo(t) {
            return t.flat().some(e => h(e, "position") === "absolute");
        }
        function ih(t, e, i) {
            const s = [], n = [], o = Array(t[0].length).fill(0);
            let r = 0;
            for (let a of t) {
                U && a.reverse();
                let l = 0;
                for (const c in a) {
                    const {offsetWidth: u, offsetHeight: d} = a[c], f = i ? c : o.indexOf(Math.min(...o));
                    Ns(s, f, a[c]), Ns(n, f, [ (f - c) * u * (U ? -1 : 1), o[f] - r ]), o[f] += d + e, 
                    l = Math.max(l, d);
                }
                r += l + e;
            }
            return [ s, n ];
        }
        function sh(t, e) {
            const i = t.flat().find(s => $(s, e));
            return S(i ? h(i, "marginTop") : h(t[0][0], "paddingLeft"));
        }
        function nh(t) {
            const e = [];
            for (const i of t) for (const s in i) Ns(e, s, i[s]);
            return e;
        }
        function Ns(t, e, i) {
            t[e] || (t[e] = []), t[e].push(i);
        }
        var oh = {
            args: "target",
            props: {
                target: String,
                row: Boolean
            },
            data: {
                target: "> *",
                row: !0
            },
            computed: {
                elements: ({target: t}, e) => D(t, e)
            },
            observe: dt({
                target: ({$el: t, elements: e}) => e.reduce((i, s) => i.concat(s, ...s.children), [ t ])
            }),
            events: {
                name: "loadingdone",
                el: () => document.fonts,
                handler() {
                    this.$emit("resize");
                }
            },
            update: {
                read() {
                    return {
                        rows: (this.row ? ws(this.elements) : [ this.elements ]).map(rh)
                    };
                },
                write({rows: t}) {
                    for (const {heights: e, elements: i} of t) i.forEach((s, n) => h(s, "minHeight", e[n]));
                },
                events: [ "resize" ]
            }
        };
        function rh(t) {
            if (t.length < 2) return {
                heights: [ "" ],
                elements: t
            };
            let e = t.map(ah);
            const i = Math.max(...e);
            return {
                heights: t.map((s, n) => e[n].toFixed(2) === i.toFixed(2) ? "" : i),
                elements: t
            };
        }
        function ah(t) {
            const e = oi(t.style, [ "display", "minHeight" ]);
            q(t) || h(t, "display", "block", "important"), h(t, "minHeight", "");
            const i = g(t).height - ge(t, "height", "content-box");
            return h(t, e), i;
        }
        var lh = {
            args: "target",
            props: {
                target: String
            },
            data: {
                target: ""
            },
            computed: {
                target: {
                    get: ({target: t}, e) => et(t, e),
                    observe: ({target: t}) => t
                }
            },
            observe: dt({
                target: ({target: t}) => t
            }),
            update: {
                read() {
                    return this.target ? {
                        height: this.target.offsetHeight
                    } : !1;
                },
                write({height: t}) {
                    h(this.$el, "minHeight", t);
                },
                events: [ "resize" ]
            }
        }, hh = {
            props: {
                expand: Boolean,
                offsetTop: Boolean,
                offsetBottom: Boolean,
                min: Number,
                property: String
            },
            data: {
                expand: !1,
                offsetTop: !1,
                offsetBottom: !1,
                min: 0,
                property: "min-height"
            },
            observe: [ bs({
                filter: ({expand: t}) => t
            }), dt({
                target: ({$el: t}) => Xt(t)
            }) ],
            update: {
                read() {
                    if (!q(this.$el)) return !1;
                    let t = "";
                    const e = ge(this.$el, "height", "content-box"), {body: i, scrollingElement: s} = document, n = Bt(this.$el), {height: o} = at(n === i ? s : n), r = s === n || i === n;
                    if (t = `calc(${r ? "100vh" : `${o}px`}`, this.expand) {
                        const a = g(n).height - g(this.$el).height;
                        t += ` - ${a}px`;
                    } else {
                        if (this.offsetTop) if (r) {
                            const a = this.offsetTop === !0 ? this.$el : et(this.offsetTop, this.$el), {top: l} = T(a);
                            t += l > 0 && l < o / 2 ? ` - ${l}px` : "";
                        } else t += ` - ${ge(n, "height", h(n, "boxSizing"))}px`;
                        this.offsetBottom === !0 ? t += ` - ${g(this.$el.nextElementSibling).height}px` : mt(this.offsetBottom) ? t += ` - ${this.offsetBottom}vh` : this.offsetBottom && oe(this.offsetBottom, "px") ? t += ` - ${S(this.offsetBottom)}px` : H(this.offsetBottom) && (t += ` - ${g(et(this.offsetBottom, this.$el)).height}px`);
                    }
                    return t += `${e ? ` - ${e}px` : ""})`, {
                        minHeight: t
                    };
                },
                write({minHeight: t}) {
                    h(this.$el, this.property, `max(${this.min || 0}px, ${t})`);
                },
                events: [ "resize" ]
            }
        }, ch = '<svg width="14" height="14" viewBox="0 0 14 14"><line fill="none" stroke="#000" stroke-width="1.1" x1="1" y1="1" x2="13" y2="13"/><line fill="none" stroke="#000" stroke-width="1.1" x1="13" y1="1" x2="1" y2="13"/></svg>', uh = '<svg width="20" height="20" viewBox="0 0 20 20"><line fill="none" stroke="#000" stroke-width="1.4" x1="1" y1="1" x2="19" y2="19"/><line fill="none" stroke="#000" stroke-width="1.4" x1="19" y1="1" x2="1" y2="19"/></svg>', dh = '<svg width="12" height="12" viewBox="0 0 12 12"><polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"/></svg>', fh = '<svg width="20" height="20" viewBox="0 0 20 20"><rect width="1" height="11" x="9" y="4"/><rect width="11" height="1" x="4" y="9"/></svg>', ph = '<svg width="14" height="14" viewBox="0 0 14 14"><polyline fill="none" stroke="#000" stroke-width="1.1" points="1 4 7 10 13 4"/></svg>', gh = '<svg width="12" height="12" viewBox="0 0 12 12"><polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"/></svg>', mh = '<svg width="12" height="12" viewBox="0 0 12 12"><polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"/></svg>', vh = '<svg width="20" height="20" viewBox="0 0 20 20"><style>.uk-navbar-toggle-icon svg&gt;[class*=&quot;line-&quot;]{transition:0.2s ease-in-out;transition-property:transform, opacity;transform-origin:center;opacity:1}.uk-navbar-toggle-icon svg&gt;.line-3{opacity:0}.uk-navbar-toggle-animate[aria-expanded=&quot;true&quot;] svg&gt;.line-3{opacity:1}.uk-navbar-toggle-animate[aria-expanded=&quot;true&quot;] svg&gt;.line-2{transform:rotate(45deg)}.uk-navbar-toggle-animate[aria-expanded=&quot;true&quot;] svg&gt;.line-3{transform:rotate(-45deg)}.uk-navbar-toggle-animate[aria-expanded=&quot;true&quot;] svg&gt;.line-1,.uk-navbar-toggle-animate[aria-expanded=&quot;true&quot;] svg&gt;.line-4{opacity:0}.uk-navbar-toggle-animate[aria-expanded=&quot;true&quot;] svg&gt;.line-1{transform:translateY(6px) scaleX(0)}.uk-navbar-toggle-animate[aria-expanded=&quot;true&quot;] svg&gt;.line-4{transform:translateY(-6px) scaleX(0)}</style><rect width="20" height="2" y="3" class="line-1"/><rect width="20" height="2" y="9" class="line-2"/><rect width="20" height="2" y="9" class="line-3"/><rect width="20" height="2" y="15" class="line-4"/></svg>', bh = '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="1" height="40" x="19" y="0"/><rect width="40" height="1" x="0" y="19"/></svg>', wh = '<svg width="7" height="12" viewBox="0 0 7 12"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 1 6 6 1 11"/></svg>', xh = '<svg width="7" height="12" viewBox="0 0 7 12"><polyline fill="none" stroke="#000" stroke-width="1.2" points="6 1 1 6 6 11"/></svg>', Go = '<svg width="20" height="20" viewBox="0 0 20 20"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9" cy="9" r="7"/><path fill="none" stroke="#000" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"/></svg>', $h = '<svg width="40" height="40" viewBox="0 0 40 40"><circle fill="none" stroke="#000" stroke-width="1.8" cx="17.5" cy="17.5" r="16.5"/><line fill="none" stroke="#000" stroke-width="1.8" x1="38" y1="39" x2="29" y2="30"/></svg>', yh = '<svg width="24" height="24" viewBox="0 0 24 24"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10.5" cy="10.5" r="9.5"/><line fill="none" stroke="#000" stroke-width="1.1" x1="23" y1="23" x2="17" y2="17"/></svg>', kh = '<svg width="25" height="40" viewBox="0 0 25 40"><polyline fill="none" stroke="#000" stroke-width="2" points="4.002,38.547 22.527,20.024 4,1.5"/></svg>', Sh = '<svg width="14" height="24" viewBox="0 0 14 24"><polyline fill="none" stroke="#000" stroke-width="1.4" points="1.225,23 12.775,12 1.225,1"/></svg>', Ih = '<svg width="25" height="40" viewBox="0 0 25 40"><polyline fill="none" stroke="#000" stroke-width="2" points="20.527,1.5 2,20.024 20.525,38.547"/></svg>', Eh = '<svg width="14" height="24" viewBox="0 0 14 24"><polyline fill="none" stroke="#000" stroke-width="1.4" points="12.775,1 1.225,12 12.775,23"/></svg>', Th = '<svg width="30" height="30" viewBox="0 0 30 30"><circle fill="none" stroke="#000" cx="15" cy="15" r="14"/></svg>', Ch = '<svg width="18" height="10" viewBox="0 0 18 10"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 9 9 1 17 9"/></svg>', Xo = {
            args: "src",
            props: {
                width: Number,
                height: Number,
                ratio: Number
            },
            data: {
                ratio: 1
            },
            connected() {
                this.svg = this.getSvg().then(t => {
                    if (!this._connected) return;
                    const e = Ph(t, this.$el);
                    return this.svgEl && e !== this.svgEl && Q(this.svgEl), _h.call(this, e, t), this.svgEl = e;
                }, A);
            },
            disconnected() {
                this.svg.then(t => {
                    this._connected || (Vi(this.$el) && (this.$el.hidden = !1), Q(t), this.svgEl = null);
                }), this.svg = null;
            },
            methods: {
                async getSvg() {}
            }
        };
        function Ph(t, e) {
            if (Vi(e) || F(e, "canvas")) {
                e.hidden = !0;
                const s = e.nextElementSibling;
                return Jo(t, s) ? s : gi(e, t);
            }
            const i = e.lastElementChild;
            return Jo(t, i) ? i : W(e, t);
        }
        function Jo(t, e) {
            return F(t, "svg") && F(e, "svg") && t.innerHTML === e.innerHTML;
        }
        function _h(t, e) {
            const i = [ "width", "height" ];
            let s = i.map(o => this[o]);
            s.some(o => o) || (s = i.map(o => k(e, o)));
            const n = k(e, "viewBox");
            n && !s.some(o => o) && (s = n.split(" ").slice(2)), s.forEach((o, r) => k(t, i[r], S(o) * this.ratio || null));
        }
        function Ko(t, e) {
            return e && v(t, "<symbol") && (t = Oh(t)[e] || t), E(It(t)).filter(ae)[0];
        }
        const Ah = /<symbol([^]*?id=(['"])(.+?)\2[^]*?<\/)symbol>/g, Oh = ct(function(t) {
            const e = {};
            let i;
            for (;i = Ah.exec(t); ) e[i[3]] = `<svg ${i[1]}svg>`;
            return e;
        }), zi = {
            spinner: Th,
            totop: Ch,
            marker: fh,
            "close-icon": ch,
            "close-large": uh,
            "drop-parent-icon": dh,
            "nav-parent-icon": gh,
            "nav-parent-icon-large": ph,
            "navbar-parent-icon": mh,
            "navbar-toggle-icon": vh,
            "overlay-icon": bh,
            "pagination-next": wh,
            "pagination-previous": xh,
            "search-icon": Go,
            "search-medium": yh,
            "search-large": $h,
            "search-toggle-icon": Go,
            "slidenav-next": Sh,
            "slidenav-next-large": kh,
            "slidenav-previous": Eh,
            "slidenav-previous-large": Ih
        }, zs = {
            install: jh,
            mixins: [ Xo ],
            args: "icon",
            props: {
                icon: String
            },
            isIcon: !0,
            beforeConnect() {
                I(this.$el, "uk-icon");
            },
            async connected() {
                const t = await this.svg;
                t && (t.ariaHidden = !0);
            },
            methods: {
                async getSvg() {
                    const t = qh(this.icon);
                    if (!t) throw "Icon not found.";
                    return t;
                }
            }
        }, ie = {
            args: !1,
            extends: zs,
            data: t => ({
                icon: Ft(t.constructor.options.name)
            }),
            beforeConnect() {
                I(this.$el, this.$options.id);
            }
        }, Mh = {
            extends: ie,
            beforeConnect() {
                const t = this.$props.icon;
                this.icon = this.$el.closest(".uk-nav-primary") ? `${t}-large` : t;
            }
        }, Dh = {
            extends: ie,
            mixins: [ Ei ],
            i18n: {
                toggle: "Open Search",
                submit: "Submit Search"
            },
            beforeConnect() {
                const t = $(this.$el, "uk-search-toggle") || $(this.$el, "uk-navbar-toggle");
                if (this.icon = t ? "search-toggle-icon" : $(this.$el, "uk-search-icon") && this.$el.closest(".uk-search-large") ? "search-large" : this.$el.closest(".uk-search-medium") ? "search-medium" : this.$props.icon, 
                !Pt(this.$el, "aria-label")) if (t) this.$el.ariaLabel = this.t("toggle"); else {
                    const e = this.$el.closest("a,button");
                    e && (e.ariaLabel = this.t("submit"));
                }
            }
        }, Bh = {
            extends: ie,
            beforeConnect() {
                this.$el.role = "status";
            },
            methods: {
                async getSvg() {
                    const t = await zs.methods.getSvg.call(this);
                    return this.ratio !== 1 && h(x("circle", t), "strokeWidth", 1 / this.ratio), t;
                }
            }
        }, se = {
            extends: ie,
            mixins: [ Ei ],
            beforeConnect() {
                const t = this.$el.closest("a,button");
                k(t, "role", this.role !== null && F(t, "a") ? "button" : this.role);
                const e = this.t("label");
                e && !Pt(t, "aria-label") && k(t, "aria-label", e);
            }
        }, Zo = {
            extends: se,
            beforeConnect() {
                I(this.$el, "uk-slidenav");
                const t = this.$props.icon;
                this.icon = $(this.$el, "uk-slidenav-large") ? `${t}-large` : t;
            }
        }, Nh = {
            extends: se,
            i18n: {
                label: "Open menu"
            },
            beforeConnect() {
                const t = this.$el.closest("a,button");
                t && (t.ariaExpanded = !1);
            }
        }, zh = {
            extends: se,
            i18n: {
                label: "Close"
            },
            beforeConnect() {
                this.icon = `close-${$(this.$el, "uk-close-large") ? "large" : "icon"}`;
            }
        }, Fh = {
            extends: se,
            i18n: {
                label: "Open"
            }
        }, Hh = {
            extends: se,
            i18n: {
                label: "Back to top"
            }
        }, Lh = {
            extends: se,
            i18n: {
                label: "Next page"
            },
            data: {
                role: null
            }
        }, Wh = {
            extends: se,
            i18n: {
                label: "Previous page"
            },
            data: {
                role: null
            }
        }, Fi = {};
        function jh(t) {
            t.icon.add = (e, i) => {
                const s = H(e) ? {
                    [e]: i
                } : e;
                he(s, (n, o) => {
                    zi[o] = n, delete Fi[o];
                }), t._initialized && Mt(document.body, n => he(t.getComponents(n), o => {
                    o.$options.isIcon && o.icon in s && o.$reset();
                }));
            };
        }
        const Rh = {
            twitter: "x"
        };
        function qh(t) {
            return t = Rh[t] || t, zi[t] ? (Fi[t] || (Fi[t] = Ko(zi[Uh(t)] || zi[t])), Fi[t].cloneNode(!0)) : null;
        }
        function Uh(t) {
            return U ? Ri(Ri(t, "left", "right"), "previous", "next") : t;
        }
        var Vh = {
            props: {
                target: String,
                selActive: String
            },
            data: {
                target: !1,
                selActive: !1
            },
            connected() {
                this.isIntersecting = 0;
            },
            computed: {
                target: ({target: t}, e) => t ? D(t, e) : e
            },
            watch: {
                target: {
                    handler() {
                        queueMicrotask(() => this.$reset());
                    },
                    immediate: !1
                }
            },
            observe: [ be({
                handler(t) {
                    this.isIntersecting = t.reduce((e, {isIntersecting: i}) => e + (i ? 1 : this.isIntersecting ? -1 : 0), this.isIntersecting), 
                    this.$emit();
                },
                target: ({target: t}) => t,
                args: {
                    intersecting: !1
                }
            }), Si({
                target: ({target: t}) => t,
                options: {
                    attributes: !0,
                    attributeFilter: [ "class" ]
                }
            }), {
                target: ({target: t}) => t,
                observe: (t, e) => {
                    const i = qe([ ...E(t), document.documentElement ], e), s = [ w(document, "scroll itemshown itemhidden", e, {
                        passive: !0,
                        capture: !0
                    }), w(document, "show hide transitionstart", n => (e(), i.observe(n.target))), w(document, "shown hidden transitionend transitioncancel", n => (e(), 
                    i.unobserve(n.target))) ];
                    return {
                        observe: i.observe.bind(i),
                        unobserve: i.unobserve.bind(i),
                        disconnect() {
                            i.disconnect(), s.map(n => n());
                        }
                    };
                },
                handler() {
                    this.$emit();
                }
            } ],
            update: {
                read() {
                    if (!this.isIntersecting) return !1;
                    for (const t of E(this.target)) {
                        let e = !this.selActive || C(t, this.selActive) ? Yh(t) : "";
                        e !== !1 && li(t, "uk-light uk-dark", e);
                    }
                }
            }
        };
        function Yh(t) {
            const e = g(t), i = g(window);
            if (!ri(e, i)) return !1;
            const {left: s, top: n, height: o, width: r} = e;
            let a;
            for (const l of [ .25, .5, .75 ]) {
                const c = t.ownerDocument.elementsFromPoint(Math.max(0, Math.min(s + r * l, i.width - 1)), Math.max(0, Math.min(n + o / 2, i.height - 1)));
                for (const u of c) {
                    if (t.contains(u) || !Gh(u) || u.closest('[class*="-leave"]') && c.some(f => u !== f && C(f, '[class*="-enter"]'))) continue;
                    const d = h(u, "--uk-inverse");
                    if (d) {
                        if (d === a) return `uk-${d}`;
                        a = d;
                        break;
                    }
                }
            }
            return a ? `uk-${a}` : "";
        }
        function Gh(t) {
            if (h(t, "visibility") !== "visible") return !1;
            for (;t; ) {
                if (h(t, "opacity") === "0") return !1;
                t = O(t);
            }
            return !0;
        }
        var Xh = {
            mixins: [ st, Pi ],
            props: {
                fill: String
            },
            data: {
                fill: "",
                clsWrapper: "uk-leader-fill",
                clsHide: "uk-leader-hide",
                attrFill: "data-fill"
            },
            computed: {
                fill: ({fill: t}, e) => t || h(e, "--uk-leader-fill-content")
            },
            connected() {
                [this.wrapper] = es(this.$el, `<span class="${this.clsWrapper}">`);
            },
            disconnected() {
                We(this.wrapper.childNodes);
            },
            observe: dt(),
            update: {
                read() {
                    return {
                        width: Math.trunc(this.$el.offsetWidth / 2),
                        fill: this.fill,
                        hide: !this.matchMedia
                    };
                },
                write({width: t, fill: e, hide: i}) {
                    L(this.wrapper, this.clsHide, i), k(this.wrapper, this.attrFill, new Array(t).join(e));
                },
                events: [ "resize" ]
            }
        }, Jh = {
            install: Kh,
            mixins: [ Ps ],
            data: {
                clsPage: "uk-modal-page",
                selPanel: ".uk-modal-dialog",
                selClose: '[class*="uk-modal-close"]'
            },
            events: [ {
                name: "fullscreenchange webkitendfullscreen",
                capture: !0,
                handler(t) {
                    F(t.target, "video") && this.isToggled() && !document.fullscreenElement && this.hide();
                }
            }, {
                name: "show",
                self: !0,
                handler() {
                    $(this.panel, "uk-margin-auto-vertical") ? I(this.$el, "uk-flex") : h(this.$el, "display", "block"), 
                    tt(this.$el);
                }
            }, {
                name: "hidden",
                self: !0,
                handler() {
                    h(this.$el, "display", ""), _(this.$el, "uk-flex");
                }
            } ]
        };
        function Kh({modal: t}) {
            t.dialog = function(i, s) {
                const n = t(x(`<div><div class="uk-modal-dialog">${i}</div></div>`), {
                    stack: !0,
                    role: "alertdialog",
                    ...s
                });
                return n.show(), w(n.$el, "hidden", async () => {
                    await Promise.resolve(), n.$destroy(!0);
                }, {
                    self: !0
                }), n;
            }, t.alert = function(i, s) {
                return e(({i18n: n}) => `<div class="uk-modal-body">${H(i) ? i : vt(i)}</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-primary uk-modal-close" type="button" autofocus>${n.ok}</button> </div>`, s);
            }, t.confirm = function(i, s) {
                return e(({i18n: n}) => `<form> <div class="uk-modal-body">${H(i) ? i : vt(i)}</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">${n.cancel}</button> <button class="uk-button uk-button-primary" autofocus>${n.ok}</button> </div> </form>`, s, () => Promise.reject());
            }, t.prompt = function(i, s, n) {
                const o = e(({i18n: l}) => `<form class="uk-form-stacked"> <div class="uk-modal-body"> <label>${H(i) ? i : vt(i)}</label> <input class="uk-input" autofocus> </div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">${l.cancel}</button> <button class="uk-button uk-button-primary">${l.ok}</button> </div> </form>`, n, () => null, () => a.value), {$el: r} = o.dialog, a = x("input", r);
                return a.value = s || "", w(r, "show", () => a.select()), o;
            }, t.i18n = {
                ok: "Ok",
                cancel: "Cancel"
            };
            function e(i, s, n = A, o = A) {
                s = {
                    bgClose: !1,
                    escClose: !0,
                    ...s,
                    i18n: {
                        ...t.i18n,
                        ...s == null ? void 0 : s.i18n
                    }
                };
                const r = t.dialog(i(s), s);
                return ft(new Promise(a => {
                    const l = w(r.$el, "hide", () => a(n()));
                    w(r.$el, "submit", "form", c => {
                        c.preventDefault(), a(o(r)), l(), r.hide();
                    });
                }), {
                    dialog: r
                });
            }
        }
        var Zh = {
            extends: Lo,
            data: {
                targets: "> .uk-parent",
                toggle: "> a",
                content: "> ul"
            }
        };
        const Fs = "uk-navbar-transparent";
        var Qh = {
            extends: Uo,
            props: {
                dropbarTransparentMode: Boolean
            },
            data: {
                delayShow: 200,
                clsDrop: "uk-navbar-dropdown",
                selNavItem: ".uk-navbar-nav > li > a,a.uk-navbar-item,button.uk-navbar-item,.uk-navbar-item a,.uk-navbar-item button,.uk-navbar-toggle",
                dropbarTransparentMode: !1
            },
            computed: {
                navbarContainer: (t, e) => e.closest(".uk-navbar-container")
            },
            watch: {
                items() {
                    const t = $(this.$el, "uk-navbar-justify"), e = D(".uk-navbar-nav, .uk-navbar-left, .uk-navbar-right", this.$el);
                    for (const i of e) {
                        const s = t ? D(".uk-navbar-nav > li > a, .uk-navbar-item, .uk-navbar-toggle", i).length : "";
                        h(i, "flexGrow", s);
                    }
                }
            },
            events: [ {
                name: "show",
                el: ({dropContainer: t}) => t,
                handler({target: t}) {
                    this.getTransparentMode(t) === "remove" && $(this.navbarContainer, Fs) && (_(this.navbarContainer, Fs), 
                    this._transparent = !0);
                }
            }, {
                name: "hide",
                el: ({dropContainer: t}) => t,
                async handler() {
                    await tc(), this._transparent && (!Y || !this.dropContainer.contains(Y.$el)) && (I(this.navbarContainer, Fs), 
                    this._transparent = null);
                }
            } ],
            methods: {
                getTransparentMode(t) {
                    if (!this.navbarContainer) return;
                    if (this.dropbar && this.isDropbarDrop(t)) return this.dropbarTransparentMode;
                    const e = this.getDropdown(t);
                    if (e && $(t, "uk-dropbar")) return e.inset ? "behind" : "remove";
                },
                getDropbarOffset(t) {
                    const {top: e, height: i} = T(this.navbarContainer);
                    return e + (this.dropbarTransparentMode === "behind" ? 0 : i + t);
                }
            }
        };
        function tc() {
            return new Promise(t => setTimeout(t));
        }
        var ec = {
            mixins: [ Ps ],
            args: "mode",
            props: {
                mode: String,
                flip: Boolean,
                overlay: Boolean,
                swiping: Boolean
            },
            data: {
                mode: "slide",
                flip: !1,
                overlay: !1,
                clsPage: "uk-offcanvas-page",
                clsContainer: "uk-offcanvas-container",
                selPanel: ".uk-offcanvas-bar",
                clsFlip: "uk-offcanvas-flip",
                clsContainerAnimation: "uk-offcanvas-container-animation",
                clsSidebarAnimation: "uk-offcanvas-bar-animation",
                clsMode: "uk-offcanvas",
                clsOverlay: "uk-offcanvas-overlay",
                selClose: ".uk-offcanvas-close",
                container: !1,
                swiping: !0
            },
            computed: {
                clsFlip: ({flip: t, clsFlip: e}) => t ? e : "",
                clsOverlay: ({overlay: t, clsOverlay: e}) => t ? e : "",
                clsMode: ({mode: t, clsMode: e}) => `${e}-${t}`,
                clsSidebarAnimation: ({mode: t, clsSidebarAnimation: e}) => t === "none" || t === "reveal" ? "" : e,
                clsContainerAnimation: ({mode: t, clsContainerAnimation: e}) => t !== "push" && t !== "reveal" ? "" : e,
                transitionElement({mode: t}) {
                    return t === "reveal" ? O(this.panel) : this.panel;
                }
            },
            observe: Pn({
                filter: ({swiping: t}) => t
            }),
            update: {
                read() {
                    this.isToggled() && !q(this.$el) && this.hide();
                },
                events: [ "resize" ]
            },
            events: [ {
                name: "touchmove",
                self: !0,
                passive: !1,
                filter: ({overlay: t}) => t,
                handler(t) {
                    t.cancelable && t.preventDefault();
                }
            }, {
                name: "show",
                self: !0,
                handler() {
                    this.mode === "reveal" && !$(O(this.panel), this.clsMode) && I(Le(this.panel, "<div>"), this.clsMode);
                    const {body: t, scrollingElement: e} = document;
                    I(t, this.clsContainer, this.clsFlip), h(t, "touchAction", "pan-y pinch-zoom"), 
                    h(this.$el, "display", "block"), h(this.panel, "maxWidth", e.clientWidth), I(this.$el, this.clsOverlay), 
                    I(this.panel, this.clsSidebarAnimation, this.mode === "reveal" ? "" : this.clsMode), 
                    tt(t), I(t, this.clsContainerAnimation), this.clsContainerAnimation && ic();
                }
            }, {
                name: "hide",
                self: !0,
                handler() {
                    _(document.body, this.clsContainerAnimation), h(document.body, "touchAction", "");
                }
            }, {
                name: "hidden",
                self: !0,
                handler() {
                    this.clsContainerAnimation && sc(), this.mode === "reveal" && $(O(this.panel), this.clsMode) && We(this.panel), 
                    _(this.panel, this.clsSidebarAnimation, this.clsMode), _(this.$el, this.clsOverlay), 
                    h(this.$el, "display", ""), h(this.panel, "maxWidth", ""), _(document.body, this.clsContainer, this.clsFlip);
                }
            }, {
                name: "swipeLeft swipeRight",
                handler(t) {
                    this.isToggled() && oe(t.type, "Left") ^ this.flip && this.hide();
                }
            } ]
        };
        function ic() {
            Qo().content += ",user-scalable=0";
        }
        function sc() {
            const t = Qo();
            t.content = t.content.replace(/,user-scalable=0$/, "");
        }
        function Qo() {
            return x('meta[name="viewport"]', document.head) || W(document.head, '<meta name="viewport">');
        }
        var nc = {
            mixins: [ st ],
            props: {
                selContainer: String,
                selContent: String,
                minHeight: Number
            },
            data: {
                selContainer: ".uk-modal",
                selContent: ".uk-modal-dialog",
                minHeight: 150
            },
            computed: {
                container: ({selContainer: t}, e) => e.closest(t),
                content: ({selContent: t}, e) => e.closest(t)
            },
            observe: dt({
                target: ({container: t, content: e}) => [ t, e ]
            }),
            update: {
                read() {
                    return !this.content || !this.container || !q(this.$el) ? !1 : {
                        max: Math.max(this.minHeight, tt(this.container) - (g(this.content).height - tt(this.$el)))
                    };
                },
                write({max: t}) {
                    h(this.$el, {
                        minHeight: this.minHeight,
                        maxHeight: t
                    });
                },
                events: [ "resize" ]
            }
        }, oc = {
            props: [ "width", "height" ],
            connected() {
                I(this.$el, "uk-responsive-width"), h(this.$el, "aspectRatio", `${this.width}/${this.height}`);
            }
        }, rc = {
            props: {
                offset: Number
            },
            data: {
                offset: 0
            },
            connected() {
                ac(this);
            },
            disconnected() {
                lc(this);
            },
            methods: {
                async scrollTo(t) {
                    t = t && x(t) || document.body, m(this.$el, "beforescroll", [ this, t ]) && (await bn(t, {
                        offset: this.offset
                    }), m(this.$el, "scrolled", [ this, t ]));
                }
            }
        };
        const ii = new Set;
        function ac(t) {
            ii.size || w(document, "click", tr), ii.add(t);
        }
        function lc(t) {
            ii.delete(t), ii.size || Yt(document, "click", tr);
        }
        function tr(t) {
            if (!t.defaultPrevented) for (const e of ii) e.$el.contains(t.target) && Vt(e.$el) && (t.preventDefault(), 
            window.location.href !== e.$el.href && window.history.pushState({}, "", e.$el.href), 
            e.scrollTo(ui(e.$el)));
        }
        const Hs = "uk-scrollspy-inview";
        var hc = {
            args: "cls",
            props: {
                cls: String,
                target: String,
                hidden: Boolean,
                margin: String,
                repeat: Boolean,
                delay: Number
            },
            data: () => ({
                cls: "",
                target: !1,
                hidden: !0,
                margin: "-1px",
                repeat: !1,
                delay: 0
            }),
            computed: {
                elements: ({target: t}, e) => t ? D(t, e) : [ e ]
            },
            watch: {
                elements(t) {
                    this.hidden && h(Ne(t, `:not(.${Hs})`), "opacity", 0);
                }
            },
            connected() {
                this.elementData = new Map;
            },
            disconnected() {
                for (const [t, e] of this.elementData.entries()) _(t, Hs, (e == null ? void 0 : e.cls) || "");
                delete this.elementData;
            },
            observe: be({
                target: ({elements: t}) => t,
                handler(t) {
                    const e = this.elementData;
                    for (const {target: i, isIntersecting: s} of t) {
                        e.has(i) || e.set(i, {
                            cls: Z(i, "uk-scrollspy-class") || this.cls
                        });
                        const n = e.get(i);
                        !this.repeat && n.show || (n.show = s);
                    }
                    this.$emit();
                },
                options: ({margin: t}) => ({
                    rootMargin: t
                }),
                args: {
                    intersecting: !1
                }
            }),
            update: [ {
                write(t) {
                    for (const [e, i] of this.elementData.entries()) i.show && !i.inview && !i.queued ? (i.queued = !0, 
                    t.promise = (t.promise || Promise.resolve()).then(() => new Promise(s => setTimeout(s, this.delay))).then(() => {
                        this.toggle(e, !0), setTimeout(() => {
                            i.queued = !1, this.$emit();
                        }, 300);
                    })) : !i.show && i.inview && !i.queued && this.repeat && this.toggle(e, !1);
                }
            } ],
            methods: {
                toggle(t, e) {
                    var i, s;
                    const n = (i = this.elementData) == null ? void 0 : i.get(t);
                    if (!n) return;
                    (s = n.off) == null || s.call(n), h(t, "opacity", !e && this.hidden ? 0 : ""), L(t, Hs, e), 
                    L(t, n.cls);
                    let o;
                    if (o = n.cls.match(/\buk-animation-[\w-]+/g)) {
                        const r = () => _(t, o);
                        e ? n.off = z(t, "animationcancel animationend", r, {
                            self: !0
                        }) : r();
                    }
                    m(t, e ? "inview" : "outview"), n.inview = e;
                }
            }
        }, cc = {
            props: {
                cls: String,
                closest: Boolean,
                scroll: Boolean,
                target: String,
                offset: Number
            },
            data: {
                cls: "uk-active",
                closest: !1,
                scroll: !1,
                target: 'a[href]:not([role="button"])',
                offset: 0
            },
            computed: {
                links: ({target: t}, e) => D(t, e).filter(Vt)
            },
            watch: {
                links(t) {
                    this.scroll && this.$create("scroll", t, {
                        offset: this.offset
                    });
                }
            },
            observe: [ be(), Ye() ],
            update: [ {
                read() {
                    const t = this.links.filter(ui), e = t.map(ui), {length: i} = e;
                    if (!i || !q(this.$el)) return !1;
                    const s = Bt(e, !0), {scrollTop: n, scrollHeight: o} = s, r = at(s), a = o - r.height;
                    let l = !1;
                    if (n >= a) l = i - 1; else {
                        const c = this.offset + g(ds()).height + r.height * .1;
                        for (let u = 0; u < e.length && !(T(e[u]).top - r.top - c > 0); u++) l = +u;
                    }
                    return {
                        active: l,
                        links: t
                    };
                },
                write({active: t, links: e}) {
                    const i = e.map(n => n.closest(this.closest || "*")), s = t !== !1 && !$(i[t], this.cls);
                    this.links.forEach(n => n.blur());
                    for (let n = 0; n < i.length; n++) L(i[n], this.cls, +n === t);
                    s && m(this.$el, "active", [ t, i[t] ]);
                },
                events: [ "scroll", "resize" ]
            } ]
        }, uc = {
            mixins: [ st, Pi ],
            props: {
                position: String,
                top: null,
                bottom: null,
                start: null,
                end: null,
                offset: String,
                offsetEnd: String,
                overflowFlip: Boolean,
                animation: String,
                clsActive: String,
                clsInactive: String,
                clsFixed: String,
                clsBelow: String,
                selTarget: String,
                showOnUp: Boolean,
                targetOffset: Number
            },
            data: {
                position: "top",
                top: !1,
                bottom: !1,
                start: !1,
                end: !1,
                offset: 0,
                offsetEnd: 0,
                overflowFlip: !1,
                animation: "",
                clsActive: "uk-active",
                clsInactive: "",
                clsFixed: "uk-sticky-fixed",
                clsBelow: "uk-sticky-below",
                selTarget: "",
                showOnUp: !1,
                targetOffset: !1
            },
            computed: {
                target: ({selTarget: t}, e) => t && x(t, e) || e
            },
            connected() {
                this.start = er(this.start || this.top), this.end = er(this.end || this.bottom), 
                this.placeholder = x("+ .uk-sticky-placeholder", this.$el) || x('<div class="uk-sticky-placeholder"></div>'), 
                this.isFixed = !1, this.setActive(!1);
            },
            beforeDisconnect() {
                this.isFixed && (this.hide(), _(this.target, this.clsInactive)), Ws(this.$el), Q(this.placeholder), 
                this.placeholder = null;
            },
            observe: [ bs(), Ye({
                target: () => document.scrollingElement
            }), dt({
                target: ({$el: t}) => [ t, Hi(t), document.scrollingElement ],
                handler(t) {
                    this.$emit(this._data.resized && t.some(({target: e}) => e === Hi(this.$el)) ? "update" : "resize"), 
                    this._data.resized = !0;
                }
            }) ],
            events: [ {
                name: "load hashchange popstate",
                el: () => window,
                filter: ({targetOffset: t}) => t !== !1,
                handler() {
                    const {scrollingElement: t} = document;
                    !location.hash || t.scrollTop === 0 || setTimeout(() => {
                        const e = T(x(location.hash)), i = T(this.$el);
                        this.isFixed && ri(e, i) && (t.scrollTop = Math.ceil(e.top - i.height - G(this.targetOffset, "height", this.placeholder) - G(this.offset, "height", this.placeholder)));
                    });
                }
            } ],
            update: [ {
                read({height: t, width: e, margin: i, sticky: s}, n) {
                    if (this.inactive = !this.matchMedia || !q(this.$el) || !this.$el.offsetHeight, 
                    this.inactive) return;
                    const o = tt(window), r = Math.max(0, document.scrollingElement.scrollHeight - o);
                    if (!r) {
                        this.inactive = !0;
                        return;
                    }
                    const a = this.isFixed && n.has("update");
                    a && (Rs(this.target), this.hide()), this.active || (({height: t, width: e} = g(this.$el)), 
                    i = h(this.$el, "margin")), a && this.show();
                    const l = G("100vh", "height");
                    let c = this.position;
                    this.overflowFlip && t > l && (c = c === "top" ? "bottom" : "top");
                    const u = this.isFixed ? this.placeholder : this.$el;
                    let [d, f] = [ this.offset, this.offsetEnd ].map(zt => G(zt, "height", s ? this.$el : u));
                    c === "bottom" && (t < o || this.overflowFlip) && (d += o - t);
                    const p = t + d + f, b = this.overflowFlip ? 0 : Math.max(0, p - l), y = T(u).top - new DOMMatrix(h(u, "transform")).m42, P = g(this.$el).height, it = (this.start === !1 ? y : Ls(this.start, this.$el, y)) - d, Tt = this.end === !1 ? r : Math.min(r, Ls(this.end, this.$el, y + t, !0) - P - d + b);
                    return s = !this.showOnUp && it + d === y && Tt === Math.min(r, Ls(!0, this.$el, 0, !0) - P - d + b) && h(Hi(this.$el), "overflowY") !== "hidden", 
                    {
                        start: it,
                        end: Tt,
                        offset: d,
                        overflow: b,
                        height: t,
                        elHeight: P,
                        width: e,
                        margin: i,
                        top: je(u)[0],
                        sticky: s,
                        viewport: l,
                        maxScrollHeight: r
                    };
                },
                write({height: t, width: e, margin: i, offset: s, sticky: n}) {
                    if ((this.inactive || n || !this.isFixed) && Ws(this.$el), this.inactive) return;
                    n && (t = e = i = 0, h(this.$el, {
                        position: "sticky",
                        top: s
                    }));
                    const {placeholder: o} = this;
                    h(o, {
                        height: t,
                        width: e,
                        margin: i
                    }), (O(o) !== O(this.$el) || n ^ yt(o) < yt(this.$el)) && ((n ? pi : gi)(this.$el, o), 
                    o.hidden = !0);
                },
                events: [ "resize" ]
            }, {
                read({scroll: t = 0, dir: e = "down", overflow: i, overflowScroll: s = 0, start: n, end: o, elHeight: r, height: a, sticky: l, maxScrollHeight: c}) {
                    const u = Math.min(document.scrollingElement.scrollTop, c), d = t <= u ? "down" : "up", f = this.isFixed ? this.placeholder : this.$el;
                    return {
                        dir: d,
                        prevDir: e,
                        scroll: u,
                        prevScroll: t,
                        below: u > T(f).top + (l ? Math.min(a, r) : a),
                        offsetParentTop: T(f.offsetParent).top,
                        overflowScroll: K(s + K(u, n, o) - K(t, n, o), 0, i)
                    };
                },
                write(t, e) {
                    const i = e.has("scroll"), {initTimestamp: s = 0, dir: n, prevDir: o, scroll: r, prevScroll: a = 0, top: l, start: c, below: u} = t;
                    if (r < 0 || r === a && i || this.showOnUp && !i && !this.isFixed) return;
                    const d = Date.now();
                    if ((d - s > 300 || n !== o) && (t.initScroll = r, t.initTimestamp = d), !(this.showOnUp && !this.isFixed && Math.abs(t.initScroll - r) <= 30 && Math.abs(a - r) <= 10)) if (this.inactive || r < c || this.showOnUp && (r <= c || n === "down" && i || n === "up" && !this.isFixed && !u)) {
                        if (!this.isFixed) {
                            Ot.inProgress(this.$el) && l > r && (Ot.cancel(this.$el), this.hide());
                            return;
                        }
                        if (this.animation && u) {
                            if ($(this.$el, "uk-animation-leave")) return;
                            Ot.out(this.$el, this.animation).then(() => this.hide(), A);
                        } else this.hide();
                    } else this.isFixed ? this.update() : this.animation && u ? (this.show(), Ot.in(this.$el, this.animation).catch(A)) : (Rs(this.target), 
                    this.show());
                },
                events: [ "resize", "resizeViewport", "scroll" ]
            } ],
            methods: {
                show() {
                    this.isFixed = !0, this.update(), this.placeholder.hidden = !1;
                },
                hide() {
                    const {offset: t, sticky: e} = this._data;
                    this.setActive(!1), _(this.$el, this.clsFixed, this.clsBelow), e ? h(this.$el, "top", t) : Ws(this.$el), 
                    this.placeholder.hidden = !0, this.isFixed = !1;
                },
                update() {
                    let {width: t, scroll: e = 0, overflow: i, overflowScroll: s = 0, start: n, end: o, offset: r, offsetParentTop: a, sticky: l, below: c} = this._data;
                    const u = n !== 0 || e > n;
                    if (!l) {
                        let d = "fixed";
                        e > o && (r += o - a + s - i, d = "absolute"), h(this.$el, {
                            position: d,
                            width: t,
                            marginTop: 0
                        }, "important");
                    }
                    h(this.$el, "top", r - s), this.setActive(u), L(this.$el, this.clsBelow, c), I(this.$el, this.clsFixed);
                },
                setActive(t) {
                    const e = this.active;
                    this.active = t, t ? (li(this.target, this.clsInactive, this.clsActive), e !== t && m(this.$el, "active")) : (li(this.target, this.clsActive, this.clsInactive), 
                    e !== t && (Rs(this.target), m(this.$el, "inactive")));
                }
            }
        };
        function Ls(t, e, i, s) {
            if (!t) return 0;
            if (mt(t) || H(t) && t.match(/^-?\d/)) return i + G(t, "height", e, !0);
            {
                const n = t === !0 ? Hi(e) : et(t, e);
                return T(n).bottom - (s && n != null && n.contains(e) ? S(h(n, "paddingBottom")) + S(h(n, "borderBottomWidth")) : 0);
            }
        }
        function er(t) {
            return t === "true" ? !0 : t === "false" ? !1 : t;
        }
        function Ws(t) {
            h(t, {
                position: "",
                top: "",
                marginTop: "",
                width: ""
            });
        }
        const js = "uk-transition-disable";
        function Rs(t) {
            $(t, js) || (I(t, js), requestAnimationFrame(() => _(t, js)));
        }
        function Hi(t) {
            for (;t = O(t); ) if (q(t)) return t;
        }
        var dc = {
            mixins: [ Xo ],
            args: "src",
            props: {
                src: String,
                icon: String,
                attributes: "list",
                strokeAnimation: Boolean
            },
            data: {
                strokeAnimation: !1
            },
            observe: [ Si({
                async handler() {
                    const t = await this.svg;
                    t && ir.call(this, t);
                },
                options: {
                    attributes: !0,
                    attributeFilter: [ "id", "class", "style" ]
                }
            }) ],
            async connected() {
                v(this.src, "#") && ([this.src, this.icon] = this.src.split("#", 2));
                const t = await this.svg;
                t && (ir.call(this, t), this.strokeAnimation && pc(t));
            },
            methods: {
                async getSvg() {
                    return F(this.$el, "img") && !this.$el.complete && this.$el.loading === "lazy" && await new Promise(t => z(this.$el, "load", t)), 
                    Ko(await fc(this.src), this.icon) || Promise.reject("SVG not found.");
                }
            }
        };
        function ir(t) {
            const {$el: e} = this;
            I(t, k(e, "class"), "uk-svg");
            for (let i = 0; i < e.style.length; i++) {
                const s = e.style[i];
                h(t, s, h(e, s));
            }
            for (const i in this.attributes) {
                const [s, n] = this.attributes[i].split(":", 2);
                k(t, s, n);
            }
            t.ariaHidden = this.$el.ariaHidden, this.$el.id || Oe(t, "id");
        }
        const fc = ct(async t => {
            if (t) {
                const e = await fetch(t);
                if (e.headers.get("Content-Type") === "image/svg+xml") return e.text();
            }
            return Promise.reject();
        });
        function pc(t) {
            const e = go(t);
            e && h(t, "--uk-animation-stroke", e);
        }
        const qs = ".uk-disabled *, .uk-disabled, [disabled]";
        var sr = {
            mixins: [ Kt ],
            args: "connect",
            props: {
                connect: String,
                toggle: String,
                itemNav: String,
                active: Number,
                followFocus: Boolean,
                swiping: Boolean
            },
            data: {
                connect: "~.uk-switcher",
                toggle: "> * > :first-child",
                itemNav: !1,
                active: 0,
                cls: "uk-active",
                attrItem: "uk-switcher-item",
                selVertical: ".uk-nav",
                followFocus: !1,
                swiping: !0
            },
            computed: {
                connects: {
                    get: ({connect: t}, e) => ze(t, e),
                    observe: ({connect: t}) => t
                },
                connectChildren() {
                    return this.connects.map(t => N(t)).flat();
                },
                toggles: ({toggle: t}, e) => D(t, e),
                children(t, e) {
                    return N(e).filter(i => this.toggles.some(s => i.contains(s)));
                }
            },
            watch: {
                connects(t) {
                    this.swiping && h(t, "touchAction", "pan-y pinch-zoom"), this.$emit();
                },
                connectChildren() {
                    let t = Math.max(0, this.index());
                    for (const e of this.connects) N(e).forEach((i, s) => L(i, this.cls, s === t));
                    this.$emit();
                },
                toggles(t) {
                    this.$emit();
                    const e = this.index();
                    this.show(~e ? e : t[this.active] || t[0]);
                }
            },
            connected() {
                this.$el.role = "tablist";
            },
            observe: [ Ii({
                targets: ({connectChildren: t}) => t
            }), Pn({
                target: ({connects: t}) => t,
                filter: ({swiping: t}) => t
            }) ],
            events: [ {
                name: "click keydown",
                delegate: ({toggle: t}) => t,
                handler(t) {
                    !C(t.current, qs) && (t.type === "click" || t.keyCode === B.SPACE) && (Et(t), this.show(t.current));
                }
            }, {
                name: "keydown",
                delegate: ({toggle: t}) => t,
                handler(t) {
                    const {current: e, keyCode: i} = t, s = C(this.$el, this.selVertical);
                    let n = i === B.HOME ? 0 : i === B.END ? "last" : i === B.LEFT && !s || i === B.UP && s ? "previous" : i === B.RIGHT && !s || i === B.DOWN && s ? "next" : -1;
                    if (~n) {
                        t.preventDefault();
                        const o = this.toggles.filter(a => !C(a, qs)), r = o[rt(n, o, o.indexOf(e))];
                        r.focus(), this.followFocus && this.show(r);
                    }
                }
            }, {
                name: "click",
                el: ({$el: t, connects: e, itemNav: i}) => e.concat(i ? ze(i, t) : []),
                delegate: ({attrItem: t}) => `[${t}],[data-${t}]`,
                handler(t) {
                    t.target.closest("a,button") && (Et(t), this.show(Z(t.current, this.attrItem)));
                }
            }, {
                name: "swipeRight swipeLeft",
                filter: ({swiping: t}) => t,
                el: ({connects: t}) => t,
                handler({type: t}) {
                    this.show(oe(t, "Left") ? "next" : "previous");
                }
            } ],
            update() {
                var t;
                for (const e of this.connects) F(e, "ul") && (e.role = "presentation");
                k(N(this.$el), "role", "presentation");
                for (const e in this.toggles) {
                    const i = this.toggles[e], s = (t = this.connects[0]) == null ? void 0 : t.children[e];
                    i.role = "tab", s && (i.id = te(this, i), s.id = te(this, s), i.ariaControls = s.id, 
                    k(s, {
                        role: "tabpanel",
                        "aria-labelledby": i.id
                    }));
                }
                k(this.$el, "aria-orientation", C(this.$el, this.selVertical) ? "vertical" : null);
            },
            methods: {
                index() {
                    return xt(this.children, t => $(t, this.cls));
                },
                show(t) {
                    const e = this.toggles.filter(r => !C(r, qs)), i = this.index(), s = rt(!Pe(t) || v(e, t) ? t : 0, e, rt(this.toggles[i], e)), n = rt(e[s], this.toggles);
                    this.children.forEach((r, a) => {
                        L(r, this.cls, n === a), k(this.toggles[a], {
                            "aria-selected": n === a,
                            tabindex: n === a ? null : -1
                        });
                    });
                    const o = i >= 0 && i !== s;
                    this.connects.forEach(async ({children: r}) => {
                        const a = re(r).filter((l, c) => c !== n && $(l, this.cls));
                        await this.toggleElement(a, !1, o) && await this.toggleElement(r[n], !0, o);
                    });
                }
            }
        }, gc = {
            mixins: [ st ],
            extends: sr,
            props: {
                media: Boolean
            },
            data: {
                media: 960,
                attrItem: "uk-tab-item",
                selVertical: ".uk-tab-left,.uk-tab-right"
            },
            connected() {
                const t = $(this.$el, "uk-tab-left") ? "uk-tab-left" : $(this.$el, "uk-tab-right") ? "uk-tab-right" : !1;
                t && this.$create("toggle", this.$el, {
                    cls: t,
                    mode: "media",
                    media: this.media
                });
            }
        };
        const mc = 13, vc = 32;
        var bc = {
            mixins: [ Pi, Kt ],
            args: "target",
            props: {
                href: String,
                target: null,
                mode: "list",
                queued: Boolean
            },
            data: {
                href: !1,
                target: !1,
                mode: "click",
                queued: !0
            },
            computed: {
                target: {
                    get: ({target: t}, e) => (t = ze(t || e.hash, e), t.length ? t : [ e ]),
                    observe: ({target: t}) => t
                }
            },
            connected() {
                v(this.mode, "media") || (Be(this.$el) || (this.$el.tabIndex = 0), !this.cls && F(this.$el, "a") && (this.$el.role = "button"));
            },
            observe: Ii({
                targets: ({target: t}) => t
            }),
            events: [ {
                name: ut,
                filter: ({mode: t}) => v(t, "hover"),
                handler(t) {
                    this._preventClick = null, !(!pt(t) || le(this._showState) || this.$el.disabled) && (m(this.$el, "focus"), 
                    z(document, ut, () => m(this.$el, "blur"), !0, e => !this.$el.contains(e.target)), 
                    v(this.mode, "click") && (this._preventClick = !0));
                }
            }, {
                name: `mouseenter mouseleave ${At} ${Ut} focus blur`,
                filter: ({mode: t}) => v(t, "hover"),
                handler(t) {
                    if (pt(t) || this.$el.disabled || document.readyState === "loading") return;
                    const e = v([ "mouseenter", At, "focus" ], t.type), i = this.isToggled(this.target);
                    if (!e && (!le(this._showState) || t.type !== "blur" && C(this.$el, ":focus") || t.type === "blur" && C(this.$el, ":hover"))) {
                        i === this._showState && (this._showState = null);
                        return;
                    }
                    e && le(this._showState) && i !== this._showState || (this._showState = e ? i : null, 
                    this.toggle(`toggle${e ? "show" : "hide"}`));
                }
            }, {
                name: "keydown",
                filter: ({$el: t, mode: e}) => v(e, "click") && !F(t, "input"),
                handler(t) {
                    (t.keyCode === vc || t.keyCode === mc) && (t.preventDefault(), this.$el.click());
                }
            }, {
                name: "click",
                filter: ({mode: t}) => [ "click", "hover" ].some(e => v(t, e)),
                handler(t) {
                    if (t.defaultPrevented) return;
                    const e = t.target.closest("a[href]"), i = Vt(e) && (!e.hash || C(this.target, e.hash));
                    (this._preventClick || i || e && !this.isToggled(this.target)) && t.preventDefault(), 
                    !this._preventClick && v(this.mode, "click") && (!e || i || t.defaultPrevented) && this.toggle();
                }
            }, {
                name: "mediachange",
                filter: ({mode: t}) => v(t, "media"),
                el: ({target: t}) => t,
                handler(t, e) {
                    e.matches ^ this.isToggled(this.target) && this.toggle();
                }
            } ],
            methods: {
                async toggle(t) {
                    if (!m(this.target, t || "toggle", [ this ])) return;
                    if (Pt(this.$el, "aria-expanded") && (this.$el.ariaExpanded = !this.isToggled(this.target)), 
                    !this.queued) return this.toggleElement(this.target);
                    const e = this.target.filter(s => $(s, this.clsLeave));
                    if (e.length) {
                        for (const s of this.target) {
                            const n = v(e, s);
                            this.toggleElement(s, n, n);
                        }
                        return;
                    }
                    const i = this.target.filter(this.isToggled);
                    await this.toggleElement(i, !1) && await this.toggleElement(this.target.filter(s => !v(i, s)), !0);
                }
            }
        }, wc = Object.freeze({
            __proto__: null,
            Accordion: Lo,
            Alert: Rl,
            Close: zh,
            Cover: Vl,
            Drop: Ro,
            DropParentIcon: ie,
            Dropdown: Ro,
            Dropnav: Uo,
            FormCustom: th,
            Grid: eh,
            HeightMatch: oh,
            HeightPlaceholder: lh,
            HeightViewport: hh,
            Icon: zs,
            Img: ua,
            Inverse: Vh,
            Leader: Xh,
            Margin: _n,
            Marker: Fh,
            Modal: Jh,
            Nav: Zh,
            NavParentIcon: Mh,
            Navbar: Qh,
            NavbarParentIcon: ie,
            NavbarToggleIcon: Nh,
            Offcanvas: ec,
            OverflowAuto: nc,
            OverlayIcon: ie,
            PaginationNext: Lh,
            PaginationPrevious: Wh,
            Responsive: oc,
            Scroll: rc,
            Scrollspy: hc,
            ScrollspyNav: cc,
            SearchIcon: Dh,
            SlidenavNext: Zo,
            SlidenavPrevious: Zo,
            Spinner: Bh,
            Sticky: uc,
            Svg: dc,
            Switcher: sr,
            Tab: gc,
            Toggle: bc,
            Totop: Hh,
            Video: Wo
        });
        return he(wc, (t, e) => ht.component(e, t)), Fl(ht), he(zl, (t, e) => ht.component(e, t)), 
        ht;
    });
    window["FLS"] = false;
    addLoadedClass();
    menuInit();
})();