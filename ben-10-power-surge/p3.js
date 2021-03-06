! function(f) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = f();
    else if ("function" == typeof define && define.amd) define([], f);
    else {
        var g;
        g = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, g.p3lib = f()
    }
}(function() {
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = "function" == typeof require && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        for (var i = "function" == typeof require && require, o = 0; o < r.length; o++) s(r[o]);
        return s
    }({
        1: [function(require, module, exports) {
            "use strict";

            function Animator() {
                this._particleSystems = null, this._emitters = null, this._movieClips = null, this._timers = null, this._tweens = null, this._paused = !1, this.init()
            }
            var MovieClip = require("./display/MovieClip"),
                Timer = require("./utils/Timer");
            module.exports = Animator, Animator.prototype.init = function() {
                this._movieClips = [], this._particleSystems = [], this._emitters = [], this._tweens = [], this._timers = [], this._paused = !1
            }, Animator.prototype.update = function() {
                this._paused || (this._updateEmitters(), this._updateParticleSystems(), this._updateTimers())
            }, Animator.prototype.add = function(a) {
                if (a instanceof cloudkid.Emitter) {
                    if (this._emitters.indexOf(a) != -1) throw new Error("'Emitter' already added!");
                    this._emitters.push(a)
                } else if (a instanceof MovieClip) {
                    if (this._movieClips.indexOf(a) != -1) throw new Error("'MovieClip' already added!");
                    this._movieClips.push(a)
                } else if (a instanceof TweenMax || a instanceof TimelineMax) {
                    if (this._tweens.indexOf(a) != -1) throw new Error("'Tween' already added!");
                    this._tweens.push(a)
                } else if (a instanceof Timer) {
                    if (this._timers.indexOf(a) != -1) throw new Error("'Timer' already added!");
                    this._timers.push(a)
                }
                return a
            }, Animator.prototype.remove = function(a) {
                var index;
                if (a instanceof cloudkid.Emitter) {
                    if (index = this._emitters.indexOf(a), index == -1) throw new Error("'Emitter' is not added!");
                    this._emitters.splice(index, 1)
                } else if (a instanceof MovieClip) {
                    if (index = this._movieClips.indexOf(a), index == -1) throw new Error("'MovieClip' is not added!");
                    a.__updateTransform && (a.updateTransform = a.__updateTransform, a.__updateTransform = null), this._movieClips.splice(index, 1)
                } else if ((a instanceof TweenMax || a instanceof TimelineMax) && this._tweens.indexOf(a) != -1) {
                    if (index = this._tweens.indexOf(a), index == -1) throw new Error("'Tween' is not added!");
                    this._tweens.splice(index, 1)
                } else if (a instanceof Timer && this._timers.indexOf(a) != -1) {
                    if (index = this._timers.indexOf(a), index == -1) throw new Error("'Timer' is not added!");
                    this._timers.splice(index, 1)
                }
            }, Animator.prototype.removeAll = function(emitters, movieClips, tweens, timers) {
                emitters = "boolean" != typeof emitters || emitters, movieClips = "boolean" != typeof movieClips || movieClips, tweens = "boolean" != typeof tweens || tweens, timers = "boolean" != typeof timers || timers, emitters && (this._particleSystems.length = this._emitters.length = 0), movieClips && (this._movieClips.length = 0), tweens && this.removeAllTweens(!0), timers && (this._timers.length = 0)
            }, Animator.prototype.removeAllTweens = function(kill) {
                for (var t, i = 0; i < this._tweens.length; ++i) t = this._tweens[i], kill && t.kill();
                this._tweens.length = 0
            }, Animator.prototype.setTimeout = function(callback, delay, scope) {
                scope = scope || window;
                var timer = new p3.Timer(delay, 1);
                return timer.signals.timerComplete.addOnce(function() {
                    callback.call(scope), this.remove(timer)
                }, this), timer.start(), this.add(timer), timer
            }, Animator.prototype._playMovieClips = function() {
                for (var mc, count = this._movieClips.length, i = 0; i < count; ++i) mc = this._movieClips[i], mc.__updateTransform && (mc.updateTransform = mc.__updateTransform, mc.__updateTransform = null)
            }, Animator.prototype._pauseMoveClips = function() {
                for (var mc, count = this._movieClips.length, i = 0; i < count; ++i) mc = this._movieClips[i], mc.__updateTransform || (mc.__updateTransform = mc.updateTransform, mc.updateTransform = function() {
                    p3.MovieClip.superClass_.updateTransform.call(this)
                })
            }, Animator.prototype._playTweens = function() {
                for (var tween, count = this._tweens.length, i = 0; i < count; ++i) tween = this._tweens[i], tween.resume()
            }, Animator.prototype._pauseTweens = function() {
                for (var tween, count = this._tweens.length, i = 0; i < count; ++i) tween = this._tweens[i], tween.pause()
            }, Animator.prototype._updateParticleSystems = function() {
                for (var emitter, count = this._particleSystems.length, i = count - 1; i >= 0; --i) emitter = this._particleSystems[i], emitter.update()
            }, Animator.prototype._updateEmitters = function() {
                for (var emitter, count = this._emitters.length, i = count - 1; i >= 0; --i) emitter = this._emitters[i], emitter.update(p3.Timestep.deltaTime)
            }, Animator.prototype._updateTimers = function() {
                for (var timer, count = this._timers.length, i = count - 1; i >= 0; --i) timer = this._timers[i], timer.update()
            }, Object.defineProperty(Animator.prototype, "paused", {
                get: function() {
                    return this._paused
                },
                set: function(value) {
                    this._paused = value, this._paused ? (this._pauseMoveClips(), this._pauseTweens()) : (this._playMovieClips(), this._playTweens())
                }
            })
        }, {
            "./display/MovieClip": 15,
            "./utils/Timer": 47
        }],
        2: [function(require, module, exports) {
            "use strict";

            function AssetManager() {
                this.signals = {}, this.signals.progress = new signals.Signal, this.signals.complete = new signals.Signal, this.signals.error = new signals.Signal, this._loader = new PIXI.loaders.Loader, this._loader.on("progress", this.onLoaderProgress, this), this._loader.on("complete", this.onLoaderComplete, this), this._loader.on("error", this.onLoaderError, this), this._manifest = [], this._resources = {}, this._fallbackTexture = PIXI.Texture.EMPTY
            }
            module.exports = AssetManager, AssetManager._instance = null, AssetManager.prototype.addFiles = function(files, path) {
                if (path = path || "", path && path.length > 0)
                    for (var url, i = 0; i < files.length; ++i) url = files[i].url, files[i].url = path + url;
                return this._manifest = this._manifest.concat(files), this._manifest
            }, AssetManager.prototype.load = function() {
                if (this._manifest.length) return this._loader.add(this._manifest), this._loader.load(), this._manifest
            }, AssetManager.prototype.unloadTexture = function(filename, extension) {
                extension = "." + (extension || "png");
                var resource = this._resources[filename],
                    split = resource.url.split("."),
                    texture = PIXI.utils.TextureCache[split[0] + extension];
                texture.destroy(!0)
            }, AssetManager.prototype.getTexture = function(filename, extension) {
                extension = "." + (extension || "png");
                var texture;
                try {
                    texture = PIXI.Texture.fromFrame(filename + extension)
                } catch (error) {
                    texture = this._resources[filename] ? this._resources[filename].texture : this._fallbackTexture
                }
                return texture
            }, AssetManager.prototype.getJSON = function(filename) {
                var data = p3.Utils.cloneObject(this._resources[filename].data);
                return data
            }, AssetManager.prototype.getSpineData = function(filename) {
                var resource = this._resources[filename];
                return !resource || resource && !resource.spineData, resource.spineData
            }, AssetManager.prototype.onLoaderProgress = function(loader, resource) {
                this.signals.progress.dispatch(loader, resource, loader.progress)
            }, AssetManager.prototype.onLoaderComplete = function(loader, resources) {
                var resource;
                for (var i in resources) resources.hasOwnProperty(i) && (resource = resources[i], this._resources[i] = resource);
                this._manifest.length = 0, this._loader.reset(), this.signals.complete.dispatch(loader, resources)
            }, AssetManager.prototype.onLoaderError = function(error, loader, resource) {
                this.signals.error.dispatch(error, loader, resource)
            }, Object.defineProperty(AssetManager, "instance", {
                get: function() {
                    return !AssetManager._instance && (AssetManager._instance = new AssetManager), AssetManager._instance
                }
            }), Object.defineProperty(AssetManager.instance, "manifest", {
                get: function() {
                    return this._manifest.slice()
                }
            })
        }, {}],
        3: [function(require, module, exports) {
            "use strict";

            function Scene() {
                this.signals = {}, this.signals.next = new signals.Signal, this.signals.previous = new signals.Signal, this.signals.home = new signals.Signal, this.signals.pause = new signals.Signal, this.loaded = !1, PIXI.Container.call(this)
            }
            module.exports = Scene, Scene.prototype = Object.create(PIXI.Container.prototype), Scene.prototype.constructor = Scene, Scene.prototype.preloader = function() {
                return new Scene
            }, Scene.prototype.load = function() {
                return []
            }, Scene.prototype.unload = function() {}, Scene.prototype.init = function() {}, Scene.prototype.destroy = function() {
                this.signals.next.dispose(), this.signals.previous.dispose(), this.signals.home.dispose(), this.signals.pause.dispose(), this.removeChildren()
            }, Scene.prototype.dispose = Scene.prototype.destroy, Scene.prototype.resize = function() {}, Scene.prototype.update = function() {}, Scene.prototype.appear = function() {
                this.animateIn()
            }, Scene.prototype.show = function() {
                this.animateIn()
            }, Scene.prototype.hide = function() {}, Scene.prototype.animateIn = function(callback, scope) {
                scope = scope || window, callback && callback.call(scope)
            }, Scene.prototype.animateOut = function(callback, scope) {
                scope = scope || window, callback && callback.call(scope)
            }
        }, {}],
        4: [function(require, module, exports) {
            "use strict";

            function SceneManager(renderer) {
                this.updateAll = !1, this.loadPath = "assets/", this.loadDelay = 2, this.signals = {}, this.signals.add = new signals.Signal, this.signals.remove = new signals.Signal, this._view = new PIXI.Container, this._renderer = renderer, this._stack = [], this._next = null, this._nextPreload = null, this._removeCount = 0, this._transition = null, this._nextTransition = null, this._transitionInProgress = !1, this._preloader = null
            }
            var AssetManager = require("./AssetManager"),
                Transition = (require("./Scene"), require("./transitions/Transition"));
            module.exports = SceneManager, SceneManager.prototype.update = function() {
                if (this.swap(!0), this._stack.length)
                    if (this.updateAll)
                        for (var scene, i = this._stack.length - 1; i >= 0; --i) scene = this._stack[i], scene.update();
                    else this.top.update()
            }, SceneManager.prototype.preload = function(scene) {
                var manifest = scene.load();
                if (!scene.loaded && manifest.length > 0) {
                    var assets = AssetManager.instance;
                    return assets.addFiles(manifest, this.loadPath), assets.signals.progress.add(this.onPreloaderProgress, this), assets.signals.complete.add(this.onPreloaderComplete, this), assets.load(), console.log("loading scene..."), !0
                }
                return !1
            }, SceneManager.prototype.swap = function() {
                if (this._transition && !this._transitionInProgress) {
                    var scene = this._next;
                    if (scene) {
                        var manifest = scene.load();
                        if (!scene.loaded && manifest.length > 0) {
                            this._nextPreload = scene, this._nextTransition = this._transition;
                            var preloader = scene.preloader();
                            if (preloader && (this._preloader = scene = preloader), !scene) return void this.preload(scene)
                        }
                    }
                    var count = this._removeCount,
                        transition = this._transition;
                    this._next = null, this._transition = null, transition.init(), this._view.addChild(transition), this._transitionInProgress = !0, transition.signals["in"].addOnce(function(transition) {
                        var i;
                        if (this._preloader && this.top == this._preloader && (this.top.parent && this.top.parent.removeChild(this.top), this.top.destroy(), this.top.unload(), this._stack.pop(), this._preloader = null), scene) {
                            if (this.top)
                                if (this.top.hide(), transition.push) {
                                    if (transition.replace) {
                                        var temp;
                                        for (i = 0; i < this._stack.length; ++i) temp = this._stack[i], temp.parent && temp.parent.removeChild(temp)
                                    }
                                } else
                                    for (; this.top;) this.top.parent && this.top.parent.removeChild(this.top), this.top.destroy(), this.top.unload(), this._stack.pop()
                        } else
                            for (i = 0; i < count; ++i) this.top.hide(), this.top.parent && this.top.parent.removeChild(this.top), this.top.destroy(), this.top.unload(), this._stack.pop();
                        scene ? (scene.init(), this._stack.push(scene)) : scene = this.top, scene.resize(), scene.parent || this._view.addChildAt(scene, transition.parent.getChildIndex(transition)), transition.wait || scene.appear(), transition.out(), console.log(this._stack)
                    }, this), transition.signals.out.addOnce(function(transition) {
                        this._transitionInProgress = !1, transition.wait && (count ? scene.show() : scene.appear()), transition.parent.removeChild(transition), this._preloader != scene ? transition.destroy() : (transition.reset(), this.preload(this._nextPreload)), this.signals.add.dispatch()
                    }, this), transition["in"]()
                }
            }, SceneManager.prototype.add = function(scene, transition) {
                this._transitionInProgress || (this._next = scene, this._transition = transition || new Transition, this._removeCount = 0, !this._transition.requiresWebGL || this._renderer instanceof PIXI.WebGLRenderer || (this._transition = transition.fallback(), this._transition.push = transition.push, this._transition.replace = transition.replace, this._transition.wait = transition.wait, this._transition.update = transition.update))
            }, SceneManager.prototype.remove = function(transition, count) {
                this._transitionInProgress || (this._next = null, this._transition = transition || new Transition, this._removeCount = Math.max(1, count) || 1, !this._transition.requiresWebGL || this._renderer instanceof PIXI.WebGLRenderer || (this._transition = transition.fallback(), this._transition.push = transition.push, this._transition.replace = transition.replace, this._transition.wait = transition.wait, this._transition.update = transition.update))
            }, SceneManager.prototype.clear = function() {
                if (!this.transitionInProgress) {
                    for (var scene, i = 0; i < this._stack.length; ++i) scene = this._stack[i], scene.hide(), scene.parent.removeChild(scene), scene.dispose();
                    this._stack.length = 0
                }
            }, SceneManager.prototype.resize = function() {
                for (var scene, i = 0; i < this._stack.length; ++i) scene = this._stack[i], scene.resize();
                this._transition && this._transition.resize()
            }, SceneManager.prototype.onPreloaderProgress = function(event) {
                var loaded = event.progress / 100;
                this._preloader && (this._preloader.loaded = loaded), console.log(Math.floor(100 * loaded) + "%")
            }, SceneManager.prototype.onPreloaderComplete = function(event) {
                var assets = AssetManager.instance;
                assets.signals.progress.remove(this.onPreloaderProgress), assets.signals.complete.remove(this.onPreloaderComplete);
                var that = this;
                setTimeout(function() {
                    that._next = that._nextPreload, that._transition = that._nextTransition, that._nextPreload = null, that._nextTransition = null, that._next.loaded = !0, console.log("preloader finished")
                }, 1e3 * this.loadDelay), console.log("scene loaded"), console.log("preloader delay...")
            }, Object.defineProperty(SceneManager.prototype, "view", {
                get: function() {
                    return this._view
                }
            }), Object.defineProperty(SceneManager.prototype, "renderer", {
                get: function() {
                    return this._renderer
                }
            }), Object.defineProperty(SceneManager.prototype, "top", {
                get: function() {
                    return this._stack.length ? this._stack[this._stack.length - 1] : null
                }
            }), Object.defineProperty(SceneManager.prototype, "transitionInProgress", {
                get: function() {
                    return this._transitionInProgress
                }
            })
        }, {
            "./AssetManager": 2,
            "./Scene": 3,
            "./transitions/Transition": 42
        }],
        5: [function(require, module, exports) {
            "use strict";

            function Timestep(type) {
                this.maxElapsedMS = 100, this._type = type || Timestep.VARIABLE, this._lastTime = Timestep.timeInSeconds, this._accumulator = 0
            }
            module.exports = Timestep, Timestep.VERSION = "2.0.0", Timestep.VARIABLE = "variable", Timestep.SEMI_FIXED = "semi_fixed", Timestep.FIXED = "fixed", Timestep.deltaTime = 1, Timestep.speed = 1, Timestep.queue = [], Timestep.queueCall = function(func, args, scope) {
                Timestep.queue.push({
                    func: func,
                    args: args,
                    scope: scope
                })
            }, Timestep.executeCalls = function() {
                for (var sync, i = 0; i < Timestep.queue.length; ++i) sync = Timestep.queue[i], sync.func.apply(sync.scope, sync.args);
                Timestep.queue.length = 0
            }, Timestep.prototype.init = function(update, render, scope) {
                function variable() {
                    var time = window.performance.now(),
                        elapsedMS = Math.min(that.maxElapsedMS, time - that._lastTime);
                    Timestep.deltaTime = .001 * elapsedMS * Timestep.speed, that._lastTime = time, Timestep.executeCalls(), update.call(scope), render.call(scope), requestAnimationFrame(frame)
                }

                function semi() {
                    var time = .001 * window.performance.now(),
                        elapsedMS = time - that._lastTime;
                    for (that._lastTime = time, Timestep.executeCalls(), that._accumulator += elapsedMS; that._accumulator >= Timestep.deltaTime;) update.call(scope), that._accumulator -= Timestep.deltaTime;
                    render.call(scope), requestAnimationFrame(frame)
                }

                function fixed() {
                    Timestep.executeCalls(), update.call(scope), render.call(scope), requestAnimationFrame(frame)
                }
                var frame, that = this;
                switch (this._type) {
                    case Timestep.VARIABLE:
                        frame = variable, this._lastTime = 0;
                        break;
                    case Timestep.SEMI_FIXED:
                        frame = semi, this._lastTime = 0, this._accumulator = 0, Timestep.deltaTime = 1 / 60;
                        break;
                    case Timestep.FIXED:
                        frame = fixed, Timestep.deltaTime = 1 / 60
                }
                requestAnimationFrame(frame), window.onfocus = function() {
                    that._lastTime = Timestep.timeInSeconds
                }
            }, Object.defineProperty(Timestep, "frameInterval", {
                get: function() {
                    return this._frameInterval
                }
            }), Object.defineProperty(Timestep, "time", {
                get: function() {
                    return window.performance.now()
                }
            }), Object.defineProperty(Timestep, "timeInSeconds", {
                get: function() {
                    return Timestep.time / 1e3
                }
            })
        }, {}],
        6: [function(require, module, exports) {
            "use strict";

            function View(params) {
                this.params = params, this.signals = {}, this.signals.ready = new signals.Signal, this.signals.resize = new signals.Signal, this._holder = null, this._canvas = null, this._iosfix = null, this._rotateImage = null, this._width = this.params.width, this._height = this.params.height, this._targetOrientation = this.orientation, "complete" !== document.readyState ? window.self.onload = this.onLoad.bind(this) : this.onLoad()
            }
            var Device = require("./utils/Device");
            require("./ViewParams");
            module.exports = View, View.holder = null, View.canvas = null, View.width = 0, View.height = 0, View.center = new PIXI.Point, View.inverseCanvasScale = function(f, resolution) {
                return resolution = "string" == typeof resolution ? 1 / resolution : 1, f * (1 / (parseFloat(p3.View.holder.style.height) / parseFloat(p3.View.canvas.height))) * resolution
            }, View.prototype.onLoad = function() {
                function init() {
                    this.createHolder(), this.createCanvas(), this.createRotateImage(), this.disableInteractions(), Device.isCocoonJS ? (this.updateDimensions(this.params.width * (window.innerWidth / this.params.width) / (window.innerHeight / this.params.height), this.params.height), this.signals.ready.dispatch(this._canvas)) : (Device.isAndroid ? window.self.addEventListener("orientationchange", this.onOrientationChange.bind(this), !1) : window.self.addEventListener("resize", this.onResize.bind(this), !1), this.signals.ready.dispatch(this._canvas), this.resize())
                }
                var that = this;
                setTimeout(function() {
                    init.call(that)
                }, 0)
            }, View.prototype.onResize = function() {
                this.resize()
            }, View.prototype.onOrientationChange = function() {
                function listener() {
                    window.self.removeEventListener("resize", listener, !1), that.resize()
                }
                window.self.addEventListener("resize", listener, !1);
                var that = this
            }, View.prototype.createHolder = function() {
                Device.isCocoonJS || (this._holder = document.getElementById(this.params.holderId), this._holder || (this._holder = document.createElement("div"), this._holder.id = this.params.holderId ? this.params.holderId : "game", document.body.appendChild(this._holder)), this._holder.style.position = "absolute", this._holder.style.left = "0px", this._holder.style.top = "0px", this._holder.style.width = window.self.innerWidth + "px", this._holder.style.height = window.self.innerHeight + "px", View.holder = this._holder, p3.Device.isIOS && (this._iosfix = document.createElement("div"), this._iosfix.id = "iosfix", this._iosfix.style.position = "absolute", this._iosfix.style.left = "0px", this._iosfix.style.right = "0px", this._iosfix.style.top = "0px", this._iosfix.style.bottom = "0px", this._iosfix.style.width = "100%", this._iosfix.style.height = this._holder.height + 1, this._iosfix.style.visibility = "hidden", document.body.appendChild(this._iosfix), View.iosfix = this._iosfix))
            }, View.prototype.createCanvas = function() {
                Device.isCocoonJS ? (this._canvas = document.createElement("screencanvas"), this._canvas.id = "canvas", this._canvas.width = this.params.width, this._canvas.height = this.params.height, this._canvas.style.cssText = "idtkscale:ScaleAspectFill;", document.body.appendChild(this._canvas)) : (this._canvas = document.createElement("canvas"), this._canvas.id = "canvas", this._canvas.tabIndex = 1, this._canvas.style.position = "absolute", this._canvas.style.left = "0px", this._canvas.style.right = "0px", this._canvas.style.top = "0px", this._canvas.style.bottom = "0px", this._canvas.style.width = "100%", this._canvas.style.height = "100%", this._canvas.style.overflow = "visible", this._canvas.style.display = "block", this._holder.appendChild(this._canvas)), View.canvas = this._canvas
            }, View.prototype.createRotateImage = function() {
                Device.isCocoonJS || (this._rotateImage = document.createElement("div"), this._rotateImage.id = "rotateImage", this._rotateImage.style.position = "absolute", this._rotateImage.style.left = "0px", this._rotateImage.style.top = "0px", this._rotateImage.style.width = "100%", this._rotateImage.style.height = "100%", this._rotateImage.style.marginLeft = "auto", this._rotateImage.style.marginRight = "0auto", this._rotateImage.style.overflow = "visible", this._rotateImage.style.display = "none", this._rotateImage.style.zIndex = 1e3, this._rotateImage.style.backgroundImage = "url(" + this.params.rotateImageUrl + ")", this._rotateImage.style.backgroundColor = this.params.rotateImageColor, this._rotateImage.style.backgroundPosition = "50% 50%", this._rotateImage.style.backgroundRepeat = "no-repeat", this._rotateImage.style.backgroundSize = "cover", this._holder.appendChild(this._rotateImage), this._rotateImage.addEventListener("touchmove", function(event) {
                    return event.preventDefault(), !1
                }), this._rotateImage.addEventListener("touchstart", function(event) {
                    return event.preventDefault(), !1
                }), this._rotateImage.addEventListener("touchend", function(event) {
                    return event.preventDefault(), !1
                }))
            }, View.prototype.updateDimensions = function(width, height) {
                View.width = this._width = Math.round(width), View.height = this._height = Math.round(height), View.center.x = Math.round(.5 * width), View.center.y = Math.round(.5 * height)
            }, View.prototype.resize = function() {
                var width = Device.isMobile ? document.documentElement.clientWidth : window.innerWidth,
                    height = Device.isMobile ? document.documentElement.clientHeight : window.innerHeight;
                Device.isIframe ? (this._holder.style.width = "100%", this._holder.style.height = "100%") : (this._holder.style.width = width + "px", this._holder.style.height = height + "px"), p3.Device.isIOS && (this._iosfix.style.height = parseInt(this._holder.style.height) + 1 + "px"), window.scrollTo(0, 0);
                var ratiow, ratioh;
                this.params.aspectRatioFillHeight ? (ratiow = width / this.params.width, ratioh = this.params.height / height, this.updateDimensions(Math.floor(this.params.width * ratiow * ratioh), this.params.height)) : (ratiow = this.params.width / width, ratioh = height / this.params.height, this.updateDimensions(this.params.width, Math.floor(this.params.height * ratioh * ratiow))), this.toggleRotate(!this.isCorrectOrientation()), this.signals.resize.dispatch(this.isCorrectOrientation())
            }, View.prototype.toggleRotate = function(value) {
                this._canvas.style.display = value ? "none" : "block", this._rotateImage.style.display = value ? "block" : "none"
            }, View.prototype.isCorrectOrientation = function() {
                return !Device.isMobile || this.orientation === this._targetOrientation
            }, View.prototype.disableInteractions = function() {
                View.canvas.addEventListener("touchmove", function(event) {
                    return event.preventDefault(), !1
                }), View.canvas.addEventListener("touchstart", function(event) {
                    return event.preventDefault(), !1
                }), View.canvas.addEventListener("touchend", function(event) {
                    return event.preventDefault(), !1
                }), Device.isAndroidStockBrowser && (View.canvas.addEventListener("mousedown", function(event) {
                    event.stopPropagation(), event.preventDefault(), event.stopImmediatePropagation()
                }, !1), View.canvas.addEventListener("mouseup", function(event) {
                    event.stopPropagation(), event.preventDefault(), event.stopImmediatePropagation()
                }, !1), View.canvas.addEventListener("click", function(event) {
                    event.stopPropagation(), event.preventDefault(), event.stopImmediatePropagation()
                }, !1))
            }, Object.defineProperty(View.prototype, "holder", {
                get: function() {
                    return this._holder
                }
            }), Object.defineProperty(View.prototype, "orientation", {
                get: function() {
                    return this._width >= this._height ? "landscape" : "portrait"
                }
            })
        }, {
            "./ViewParams": 7,
            "./utils/Device": 44
        }],
        7: [function(require, module, exports) {
            "use strict";

            function ViewParams() {
                this.width = 0, this.height = 0, this.holderId = "", this.rotateImageUrl = "", this.rotateImageColor = "#FFFFFF", this.aspectRatioFillHeight = !0
            }
            module.exports = ViewParams
        }, {}],
        8: [function(require, module, exports) {
            var Device = (require("./../utils/Utils"), require("./../utils/Device")),
                AudioManager = function() {
                    if (!AudioManager.__allowInstance) throw new Error("AudioManager is a Singleton, use 'getInstance()'.");
                    this.signalMute = new signals.Signal, this.SOUND_GROUP_SFX = "sound_group_sfx", this.SOUND_GROUP_MUSIC = "sound_group_music", this.SOUND_GROUP_VO = "sound_group_vo", this.LOCAL_STORAGE_ID = "p3Mute", this._sounds = {}, this._soundsSFX = [], this._soundsVO = [], this._soundsMusic = [], this._previouslyPlayedSound = null, this._isMute = !1, this._isMuteSFX = !1, this._isMuteMusic = !1, this._isMuteVO = !1;
                    var hidden;
                    "undefined" != typeof document.hidden ? (hidden = "hidden", this.visibilityChange = "visibilitychange") : "undefined" != typeof document.mozHidden ? (hidden = "mozHidden", this.visibilityChange = "mozvisibilitychange") : "undefined" != typeof document.msHidden ? (hidden = "msHidden", this.visibilityChange = "msvisibilitychange") : "undefined" != typeof document.webkitHidden && (hidden = "webkitHidden", this.visibilityChange = "webkitvisibilitychange"), document.addEventListener(this.visibilityChange, function() {
                        document[hidden] ? Howler.volume(0) : Howler.volume(1)
                    }, !1)
                };
            AudioManager.prototype.constructor = AudioManager, module.exports = AudioManager, AudioManager.instance = null, Object.defineProperty(AudioManager, "instance", {
                get: function() {
                    return AudioManager.__instance || (AudioManager.__allowInstance = !0, AudioManager.__instance = new AudioManager, AudioManager.__allowInstance = !1), AudioManager.__instance
                }
            }), AudioManager.__instance = null, AudioManager.__allowInstance = !1, AudioManager.DEBUG = !1, AudioManager.FADE_OUT_DURATION = .5, AudioManager.prototype.addSounds = function(soundArray, soundExtensions, basePath) {
                basePath = basePath || "";
                for (var i = 0; i < soundArray.length; i++) {
                    for (var url = basePath + soundArray[i], urlSplit = url.split("/"), name = urlSplit[urlSplit.length - 1], urlsWithExtensionArr = [], j = 0; j < soundExtensions.length; j++) {
                        var extension = soundExtensions[j],
                            urlWithExtension = url + extension;
                        urlsWithExtensionArr.push(urlWithExtension)
                    }
                    var howl = new Howl({
                        urls: urlsWithExtensionArr,
                        volume: 1,
                        loop: !1,
                        autoplay: !1,
                        onload: function() {},
                        onloaderror: function() {
                            p3.SoundManager.DEBUG && console.warn("[AudioManager] Error loading sound:", name)
                        }
                    });
                    howl.name = name, this._sounds[name] = howl
                }
            }, AudioManager.prototype.removeSounds = function(soundsArray) {
                for (var i = 0; i < soundsArray.length; i += 1) {
                    var removeSoundName = soundsArray[i];
                    for (var soundName in this._sounds)
                        if (this._sounds.hasOwnProperty(soundName)) {
                            var temphowl = this._sounds[soundName];
                            if (temphowl.name === removeSoundName) {
                                temphowl.unload(), temphowl = null, this._sounds[soundName] = null, delete this._sounds[soundName];
                                break
                            }
                        }
                }
            }, AudioManager.prototype.playSound = function(name, params) {
                var existing = this._checkSoundAlreadyPlaying(name, this._soundsSFX);
                if (existing) return existing.play(), existing;
                var howl = this._play(name, params, this.SOUND_GROUP_SFX);
                return howl ? (this._soundsSFX.push(howl), AudioManager.DEBUG && console.log("[AudioManager] Playing Sound:", name), howl) : null
            }, AudioManager.prototype.playMusic = function(name, params) {
                var existing = this._checkSoundAlreadyPlaying(name, this._soundsMusic);
                if (existing) return existing;
                params = params || {}, params.loop = "undefined" == typeof params.loop || params.loop, params.fadeIn = params.fadeIn || 1;
                var howl = this._play(name, params, this.SOUND_GROUP_MUSIC);
                return howl ? (this._soundsMusic.push(howl), AudioManager.DEBUG && console.log("[AudioManager] Playing Music:", name), howl) : null
            }, AudioManager.prototype.playVO = function(name, params) {
                var existing = this._checkSoundAlreadyPlaying(name, this._soundsVO);
                if (existing) return existing;
                var howl = this._play(name, params, this.SOUND_GROUP_VO);
                return howl ? (this._soundsVO.push(howl), AudioManager.DEBUG && console.log("[AudioManager] Playing VO:", name), howl) : null
            }, AudioManager.prototype.mute = function(isMute) {
                this._isMute = isMute, this.muteSFX(this._isMute), this.muteMusic(this._isMute), this.muteVO(this._isMute), isMute ? Howler.mute() : Howler.unmute(), this.signalMute.dispatch(this._isMute)
            }, AudioManager.prototype.muteSFX = function(isMute) {
                this._isMuteSFX = isMute, this._isMute = isMute, this._updateSoundMuteStatus(this._isMuteSFX, this._soundsSFX), AudioManager.DEBUG && console.log("[AudioManager] MuteSFX:", this._isMuteSFX)
            }, AudioManager.prototype.muteMusic = function(isMute) {
                this._isMuteMusic = isMute, this._isMute = isMute, this._updateSoundMuteStatus(this._isMuteMusic, this._soundsMusic), AudioManager.DEBUG && console.log("[AudioManager] MuteMusic:", this._isMuteMusic)
            }, AudioManager.prototype.muteVO = function(isMute) {
                this._isMuteVO = isMute, this._sMute = isMute, this._updateSoundMuteStatus(this._isMuteVO, this._soundsVO), AudioManager.DEBUG && console.log("[AudioManager] MuteVO:", this._isMuteVO)
            }, AudioManager.prototype.toggleMute = function() {
                this.mute(!this.isMute)
            }, AudioManager.prototype.stopSound = function(name) {
                for (var tempArrs = [this._soundsSFX, this._soundsVO, this._soundsMusic], i = 0; i < tempArrs.length; i++) {
                    var tempArr = tempArrs[i],
                        existing = this._checkSoundAlreadyPlaying(name, tempArr);
                    if (existing) return void existing.stop()
                }
                AudioManager.DEBUG && console.log("[SoundManager] StopSound: Could not find sound to stop it:", name)
            }, AudioManager.prototype._saveMuteStatus = function() {
                try {
                    localStorage.setItem(this.LOCAL_STORAGE_ID, this._isMute)
                } catch (e) {
                    "QUOTA_EXCEEDED_ERR" == e ? p3.SoundManager.DEBUG && console.log("Error trying to write to local storage. Quota exceeded. ") : p3.SoundManager.DEBUG && console.log("Error trying to write to local storage.")
                }
            }, AudioManager.prototype._play = function(name, params, soundType) {
                var howl, that = this,
                    soundName = name;
                if (params = params || {}, params.volume = params.volume || 1, params.loop = "undefined" != typeof params.loop && params.loop, params.delay = params.delay || 0, params.fadeIn = "undefined" != typeof params.fadeIn ? 1e3 * params.fadeIn : 0, params.onComplete = params.onComplete || null, params.onCompleteScope = params.onCompleteScope || window, params.dontRepeat = "undefined" == typeof params.dontRepeat || params.dontRepeat, "string" != typeof name) {
                    if (!(name.length >= 0)) throw Error("[AudioManager] Sound is not a string or array: ", name);
                    if (name.length > 1) {
                        var randomSound = Math.floor(Math.random() * name.length);
                        if (params.dontRepeat)
                            for (var dontRepeatCount = 0; randomSound === this._previouslyPlayedSound;)
                                if (randomSound = Math.floor(Math.random() * name.length), dontRepeatCount++, dontRepeatCount > 10) {
                                    randomSound = 0;
                                    break
                                }
                        soundName = name[randomSound], this._previouslyPlayedSound = soundName
                    } else soundName = name[0]
                }
                for (var soundNameKey in this._sounds)
                    if (this._sounds.hasOwnProperty(soundNameKey)) {
                        var temphowl = this._sounds[soundNameKey];
                        if (temphowl.name === soundName) {
                            howl = temphowl;
                            break
                        }
                    }
                if (!howl) return void console.warn("[AudioManager] Could not find the sound:", name);
                howl.volume(params.volume), howl.loop(params.loop), Device && Device.isAndroidStockBrowser && (howl.buffer = !0), howl.on("end", function() {
                    this.off("end"), params.loop || that._removeSoundFromArray(this, soundType), params.onComplete && params.onComplete.call(params.onCompleteScope), AudioManager.DEBUG && console.log("[AudioManager] Sound ended:", this.name)
                });
                var startMuted;
                switch (soundType) {
                    case this.SOUND_GROUP_SFX:
                        startMuted = this._isMuteSFX;
                        break;
                    case this.SOUND_GROUP_MUSIC:
                        startMuted = this._isMuteMusic, this._stopExistingSound(soundType, params.fadeIn);
                        break;
                    case this.SOUND_GROUP_VO:
                        startMuted = this._isMuteVO, this._stopExistingSound(soundType, params.fadeIn);
                        break;
                    default:
                        startMuted = !1
                }
                return startMuted && (howl.mute(), params.fadeIn = 0), 0 === params.delay ? 0 === params.fadeIn ? howl.play() : howl.fadeIn(params.volume, params.fadeIn) : setTimeout(function() {
                    0 === params.fadeIn ? howl.play() : howl.fadeIn(params.volume, params.fadeIn)
                }, 1e3 * params.delay), howl
            }, AudioManager.prototype._stopExistingSound = function(soundType, fadeIn) {
                var soundArr, that = this;
                if (soundType === this.SOUND_GROUP_MUSIC) soundArr = this._soundsMusic;
                else {
                    if (soundType !== this.SOUND_GROUP_VO) return;
                    soundArr = this._soundsVO, fadeIn = 0
                }
                if (soundArr.length > 0)
                    for (var i = 0; i < soundArr.length; i += 1) {
                        var existingSound = soundArr[i];
                        that._removeSoundFromArray(existingSound, soundType), 0 === fadeIn ? existingSound.stop() : existingSound.fadeOut(0, fadeIn, function() {
                            existingSound.stop()
                        })
                    }
            }, AudioManager.prototype._removeSoundFromArray = function(howl, soundType) {
                var arr;
                switch (soundType) {
                    case this.SOUND_GROUP_SFX:
                        arr = this._soundsSFX;
                        break;
                    case this.SOUND_GROUP_MUSIC:
                        arr = this._soundsMusic;
                        break;
                    case this.SOUND_GROUP_VO:
                        arr = this._soundsVO
                }
                for (var i = 0, len = arr.length; i < len; i++) {
                    var sound = arr[i];
                    sound && sound.name === howl.name && arr.splice(i, 1)
                }
            }, AudioManager.prototype._updateSoundMuteStatus = function(isMute, soundArray) {
                for (var len = soundArray.length, i = 0; i < len; i += 1) {
                    var sound = soundArray[i];
                    isMute ? sound.mute() : sound.unmute();
                }
            }, AudioManager.prototype._checkSoundAlreadyPlaying = function(name, arr) {
                for (var i = 0, len = arr.length; i < len; i += 1) {
                    var sound = arr[i];
                    if (sound.name === name) return sound
                }
                return null
            }, AudioManager.prototype._onBlur = function() {
                Howler.mute()
            }, AudioManager.prototype._onFocus = function() {
                this._isMute || Howler.unmute()
            }, AudioManager.prototype.isMute = !1, AudioManager.prototype.isMuteSFX = !1, AudioManager.prototype.isMuteMusic = !1, AudioManager.prototype.isMuteVO = !1, AudioManager.prototype.sounds = !1, AudioManager.prototype.soundsSFX, AudioManager.prototype.soundsSFX, AudioManager.prototype.soundsMusic, AudioManager.prototype.soundsVO, Object.defineProperty(AudioManager.prototype, "isMute", {
                get: function() {
                    return this._isMute
                }
            }), Object.defineProperty(AudioManager.prototype, "isMuteSFX", {
                get: function() {
                    return this._isMuteSFX
                }
            }), Object.defineProperty(AudioManager.prototype, "isMuteMusic", {
                get: function() {
                    return this._isMuteMusic
                }
            }), Object.defineProperty(AudioManager.prototype, "isMuteVO", {
                get: function() {
                    return this._isMuteVO
                }
            }), Object.defineProperty(AudioManager.prototype, "sounds", {
                get: function() {
                    return this._sounds
                }
            }), Object.defineProperty(AudioManager.prototype, "soundsSFX", {
                get: function() {
                    return this._soundsSFX
                }
            }), Object.defineProperty(AudioManager.prototype, "soundsMusic", {
                get: function() {
                    return this._soundsMusic
                }
            }), Object.defineProperty(AudioManager.prototype, "soundsVO", {
                get: function() {
                    return this._soundsVO
                }
            })
        }, {
            "./../utils/Device": 44,
            "./../utils/Utils": 48
        }],
        9: [function(require, module, exports) {
            "use strict";

            function Camera(view, snapToPixelEnabled) {
                this.view = view || new PIXI.Point, this.targetOffset = new PIXI.Point, this.bounds = new PIXI.Rectangle((-(.5 * Number.MAX_VALUE)), (-(.5 * Number.MAX_VALUE)), Number.MAX_VALUE, Number.MAX_VALUE), this.snapToPixelEnabled = snapToPixelEnabled || !0, this.signals = {}, this.signals.trackStart = new signals.Signal, this.signals.trackFinish = new signals.Signal, this._position = new PIXI.Point((-this.view.x), (-this.view.y)), this._trackEaseX = .2, this._trackEaseY = .2, this._trackParallax = new PIXI.Point(CameraParallax.FULL, CameraParallax.FULL), this._target = null, this._targetPos = new PIXI.Point, this._layers = {}, this._tracking = !1, this._shakeDuration = 0, this._shakeTime = 0, this._shakeStrength = 0
            }
            var CameraLayer = require("./CameraLayer"),
                CameraParallax = require("./CameraParallax");
            module.exports = Camera, Camera.VERSION = "1.1.0", Camera.prototype.destroy = function() {
                this.signals.trackStart.removeAll(), this.signals.trackFinish.removeAll(), this._layers = {}
            }, Camera.prototype.dispose = Camera.prototype.destroy, Camera.prototype.update = function() {
                void 0 != this._target && (this._targetPos.x = this._target.x + this.targetOffset.x, this._targetPos.y = this._target.y + this.targetOffset.y), this._targetPos.x < this.bounds.x ? this._targetPos.x = this.bounds.x : this._targetPos.x > this.bounds.width && (this._targetPos.x = this.bounds.width), this._targetPos.y < this.bounds.y ? this._targetPos.y = this.bounds.y : this._targetPos.y > this.bounds.height && (this._targetPos.y = this.bounds.height), this._shakeTime > 0 && (this._targetPos.x += this._shakeStrength * p3.Utils.randomInt(-1, 1) * (this._shakeTime / this._shakeDuration), this._targetPos.y += this._shakeStrength * p3.Utils.randomInt(-1, 1) * (this._shakeTime / this._shakeDuration), this._shakeTime = Math.max(0, this._shakeTime - p3.Timestep.deltaTime));
                var dx = this._targetPos.x - this.view.x - this._position.x * this._trackParallax.x,
                    dy = this._targetPos.y - this.view.y - this._position.y * this._trackParallax.y;
                this._position.x += dx * (this._trackEaseX * (1 / this._trackParallax.x)), this._position.y += dy * (this._trackEaseY * (1 / this._trackParallax.y)), Math.abs(dx) < .01 && (this._position.x = this._targetPos.x - this.view.x), Math.abs(dy) < .01 && (this._position.y = this._targetPos.y - this.view.y), this.snapToPixelEnabled && (this._position.x = Math.round(this._position.x), this._position.y = Math.round(this._position.y));
                var d = dx * dx + dy * dy;
                d < .1 && !this._tracking ? (this._tracking = !0, this.signals.trackFinish.dispatch(this)) : d > .1 && this._tracking && (this._tracking = !1, this.signals.trackStart.dispatch(this)), this.updateLayers()
            }, Camera.prototype.trackTarget = function(target, reset) {
                if (void 0 != target && (void 0 == target.x || void 0 == target.y)) throw new Error("Camera target is invalid!");
                this._target = target;
                var layer = this.findLayerForObject(this._target);
                this._trackParallax.x = layer ? layer.parallax.x : 1, this._trackParallax.y = layer ? layer.parallax.y : 1, reset && (this._targetPos.x = this._target.x + this.targetOffset.x, this._targetPos.y = this._target.y + this.targetOffset.y, this._targetPos.x < this.bounds.x ? this._targetPos.x = this.bounds.x : this._targetPos.x > this.bounds.width && (this._targetPos.x = this.bounds.width), this._targetPos.y < this.bounds.y ? this._targetPos.y = this.bounds.y : this._targetPos.y > this.bounds.height && (this._targetPos.y = this.bounds.height), this.position = new PIXI.Point(this._targetPos.x - this.view.x, this._targetPos.y - this.view.y))
            }, Camera.prototype.trackPosition = function(x, y, reset) {
                this._target = null, this._targetPos.x = x, this._targetPos.y = y, this._trackParallax.x = 1, this._trackParallax.y = 1, reset && (this._targetPos.x < this.bounds.x ? this._targetPos.x = this.bounds.x : this._targetPos.x > this.bounds.width && (this._targetPos.x = this.bounds.width), this._targetPos.y < this.bounds.y ? this._targetPos.y = this.bounds.y : this._targetPos.y > this.bounds.height && (this._targetPos.y = this.bounds.height), this.position = new PIXI.Point(this._targetPos.x - this.view.x, this._targetPos.y - this.view.y))
            }, Camera.prototype.addLayer = function(name, container, parallax) {
                if (this.hasLayer(name)) throw new Error("Layer with that name already exists: '" + name + "'.");
                if (this.hasContainer(name)) throw new Error("Container already added to existing layer!");
                parallax.x = "undefined" != typeof parallax ? parallax.x : 1, parallax.y = "undefined" != typeof parallax ? parallax.y : 1;
                var layer = new CameraLayer;
                layer.container = container, layer.parallax = new PIXI.Point(parallax.x, parallax.y), this._layers[name] = layer, this.updateLayers()
            }, Camera.prototype.removeLayer = function(name) {
                if (!this.hasLayer) throw new Error("Layer does not exist!");
                this._layers[name] = null
            }, Camera.prototype.removeAllLayers = function() {
                this._layers = {}
            }, Camera.prototype.hasLayer = function(name) {
                return void 0 != this._layers[name]
            }, Camera.prototype.hasContainer = function(container) {
                for (var layer, i = 0; i < this._layers.length; ++i)
                    if (layer = this._layers[i], layer.container == container) return !0;
                return !1
            }, Camera.prototype.findLayerForObject = function(object) {
                var layer, child, count, i = 0,
                    result = null;
                for (var key in this._layers)
                    if (this._layers.hasOwnProperty(key))
                        for (layer = this._layers[key], count = layer.container.children.length, i = 0; i < count; ++i) child = layer.container.getChildAt(i), object == child && (result = layer);
                return result
            }, Camera.prototype.shake = function(duration, strength) {
                this._shakeStrength = strength, this._shakeTime = this._shakeDuration = duration
            }, Camera.prototype.getLayerByName = function(name) {
                var layer = this._layers[name];
                if (layer) return layer;
                throw new Error("Layer does not exist: '" + name + "'!")
            }, Camera.prototype.updateLayers = function() {
                for (var key in this._layers)
                    if (this._layers.hasOwnProperty(key)) {
                        var layer = this._layers[key];
                        layer.container.x = -this._position.x * layer.parallax.x, layer.container.y = -this._position.y * layer.parallax.y
                    }
            }, Object.defineProperty(Camera.prototype, "target", {
                get: function() {
                    return this._target
                }
            }), Object.defineProperty(Camera.prototype, "position", {
                get: function() {
                    return this._position
                },
                set: function(value) {
                    this._position.x = value.x * (this._trackParallax.x > 0 ? 1 / this._trackParallax.x : 1), this._position.y = value.y * (this._trackParallax.y > 0 ? 1 / this._trackParallax.y : 1), this.updateLayers()
                }
            }), Object.defineProperty(Camera.prototype, "trackEase", {
                get: function() {
                    return this._trackEaseX
                },
                set: function(value) {
                    this._trackEaseX = Math.max(.001, Math.min(1, value)), this._trackEaseY = this._trackEaseX
                }
            }), Object.defineProperty(Camera.prototype, "trackEaseX", {
                get: function() {
                    return this._trackEaseX
                },
                set: function(value) {
                    this._trackEaseX = Math.max(.001, Math.min(1, value))
                }
            }), Object.defineProperty(Camera.prototype, "trackEaseY", {
                get: function() {
                    return this._trackEaseY
                },
                set: function(value) {
                    this._trackEaseY = Math.max(.001, Math.min(1, value))
                }
            })
        }, {
            "./CameraLayer": 10,
            "./CameraParallax": 11
        }],
        10: [function(require, module, exports) {
            "use strict";

            function CameraLayer() {
                this.container = null, this.parallax = null
            }
            module.exports = CameraLayer
        }, {}],
        11: [function(require, module, exports) {
            "use strict";

            function CameraParallax() {}
            module.exports = CameraParallax, CameraParallax.NONE = 0, CameraParallax.HALF = .5, CameraParallax.FULL = 1
        }, {}],
        12: [function(require, module, exports) {
            "use strict";

            function AdditiveSprite(texture, blendStrength, blendColor, blendPasses) {
                this.blendStrength = blendStrength || 0, this.blendColor = blendColor || 16777215, this._blendPasses = Math.max(1, blendPasses) || 2, PIXI.Sprite.call(this, texture)
            }
            module.exports = AdditiveSprite, AdditiveSprite.prototype = Object.create(PIXI.Sprite.prototype), AdditiveSprite.prototype.constructor = AdditiveSprite, AdditiveSprite.prototype._renderWebGL = function(renderer) {
                if ("4.0.0" == PIXI.VERSION && this.calculateVertices(), renderer.setObjectRenderer(renderer.plugins.sprite), renderer.plugins.sprite.render(this), this.blendStrength > 0) {
                    renderer.plugins.sprite.flush();
                    var alpha = this.worldAlpha,
                        tint = this.tint;
                    this.worldAlpha = alpha * this.blendStrength, this.blendMode = PIXI.BLEND_MODES.ADD, this.tint = this.blendColor;
                    for (var i = 0; i < this._blendPasses; ++i) renderer.plugins.sprite.render(this);
                    renderer.plugins.sprite.flush(), this.worldAlpha = alpha, this.blendMode = PIXI.BLEND_MODES.NORMAL, this.tint = tint
                }
            }, Object.defineProperty(AdditiveSprite.prototype, "blendPasses", {
                get: function() {
                    return this._blendPasses
                },
                set: function(value) {
                    this._blendPasses = Math.max(1, value)
                }
            })
        }, {}],
        13: [function(require, module, exports) {
            "use strict";

            function Button(states) {
                this.animate = !1, this.defaultScale = new PIXI.Point(1, 1), this.animateOverScale = new PIXI.Point(1.1, 1.1), this.animateDownScale = new PIXI.Point(.9, .9), this.upSoundName = null, this.overSoundName = null, this.downSoundName = null, this.clickSoundName = null, this.signals = {}, this.signals.down = new signals.Signal, this.signals.up = new signals.Signal, this.signals.over = new signals.Signal, this.signals.out = new signals.Signal, this.signals.click = new signals.Signal, this.signals.animate = new signals.Signal, this._states = states, this._background = new PIXI.Sprite(this._states.normal), this._icon = new PIXI.Sprite(this._states.icon || PIXI.Texture.EMPTY), this._currentNormalTexture = this._states.normal, this._currentOverTexture = this._states.over, this._currentDownTexture = this._states.down, this._currentIconTexture = this._states.icon, this._currentIconOverTexture = this._states.iconOver, this._currentIconDownTexture = this._states.iconDown, this._tweenOver = null, this._tweenOut = null, this._tweenDown = null, this._enabled = !0, PIXI.Container.call(this), this.interactive = !0, this.buttonMode = !0, this.mousedown = this.touchstart = this.onMouseDown.bind(this), this.mouseup = this.touchend = this.onMouseUp.bind(this), this.mouseupoutside = this.touchendoutside = this.onMouseOut.bind(this), this.click = this.tap = this.onMouseClick.bind(this), this.mouseover = this.onMouseOver.bind(this), this.mouseout = this.onMouseOut.bind(this), this._background.anchor = new PIXI.Point(.5, .5), this.addChild(this._background), this._icon.anchor = new PIXI.Point(.5, .5), this.addChild(this._icon)
            }
            var ButtonStates = require("./ButtonStates"),
                Device = require("./../utils/Device");
            module.exports = Button, Button.prototype = Object.create(PIXI.Container.prototype), Button.prototype.constructor = Button, Button.create = function(normal, over, down, icon) {
                var states = new ButtonStates(normal, over, down, icon);
                return new Button(states)
            }, Button.audio = null, Button.prototype.init = function() {}, Button.prototype.destroy = function() {
                TweenMax.killTweensOf(this), TweenMax.killTweensOf(this.scale), this.removeChildren(), this.signals.up.dispose(), this.signals.down.dispose(), this.signals.over.dispose(), this.signals.out.dispose(), this.signals.click.dispose(), this.signals.animate.dispose()
            }, Button.prototype.dispose = Button.prototype.destroy, Button.prototype.onMouseDown = function(event) {
                if (this._states.down && (this._background.texture = this._currentDownTexture), this._states.iconDown && (this._icon.texture = this._currentIconDownTexture), this.animate) {
                    var tweens = TweenMax.getTweensOf(this, !0),
                        a = tweens.indexOf(this._tweenOver) > -1 ? tweens.length - 1 : tweens.length;
                    a || (this._tweenOver && (this._tweenOver.kill(), this._tweenOver = null), this._tweenDown = this.animateDown())
                }
                Button.audio && this.downSoundName && Button.audio.playSound(this.downSoundName), this._enabled && this.signals.down.dispatch(this, event)
            }, Button.prototype.onMouseUp = function(event) {
                this._background.texture = this._states.over && !p3.Device.isMobile ? this._currentOverTexture : this._currentNormalTexture, this._states.iconOver && !p3.Device.isMobile ? this._icon.texture = this._currentIconOverTexture : this._states.icon && (this._icon.texture = this._currentIconTexture), this.animate && this._tweenDown && (this._tweenDown && (this._tweenDown.kill(), this._tweenDown = null), this._tweenOver = p3.Device.isMobile ? this.animateOut() : this.animateOver()), Button.audio && this.upSoundName && Button.audio.playSound(this.upSoundName), this._enabled && this.signals.up.dispatch(this, event)
            }, Button.prototype.onMouseOver = function(event) {
                if (this._states.over && (this._background.texture = this._currentOverTexture), this._states.iconOver && (this._icon.texture = this._currentIconOverTexture), this.animate && !Device.isMobile) {
                    var tweens = TweenMax.getTweensOf(this, !0);
                    tweens.indexOf(this._tweenOver) == -1 && (this._tweenOut && (this._tweenOut.kill(), this._tweenOut = null), this._tweenOver = this.animateOver())
                }
                Button.audio && this.overSoundName && Button.audio.playSound(this.overSoundName), this._enabled && this.signals.over.dispatch(this, event)
            }, Button.prototype.onMouseOut = function(event) {
                if (this._background.texture = this._currentNormalTexture, this._states.icon && (this._icon.texture = this._currentIconTexture), this._tweenOver || this._tweenDown) {
                    var tweens = TweenMax.getTweensOf(this, !0);
                    tweens.indexOf(this._tweenOut) == -1 && (this._tweenOver && (this._tweenOver.kill(), this._tweenOver = null), this._tweenOut = this.animateOut()), tweens.indexOf(this._tweenDown) == -1 && (this._tweenDown && (this._tweenDown.kill(), this._tweenDown = null), this._tweenOut = this.animateOut())
                }
                Button.audio && this.upSoundName && Button.audio.playSound(this.upSoundName), this._enabled && this.signals.out.dispatch(this, event)
            }, Button.prototype.onMouseClick = function(event) {
                Button.audio && this.clickSoundName && Button.audio.playSound(this.clickSoundName), this._enabled && this.signals.click.dispatch(this, event)
            }, Button.prototype.animateOver = function() {
                return TweenMax.to(this.scale, .6, {
                    x: this.defaultScale.x * this.animateOverScale.x,
                    y: this.defaultScale.y * this.animateOverScale.y,
                    ease: Elastic.easeOut,
                    easeParams: [1],
                    onComplete: function() {
                        this.signals.animate.dispatch(this, "over")
                    },
                    onCompleteScope: this
                })
            }, Button.prototype.animateOut = function() {
                return TweenMax.to(this.scale, .3, {
                    x: this.defaultScale.x,
                    y: this.defaultScale.y,
                    ease: Back.easeInOut,
                    easeParams: [2],
                    onComplete: function() {
                        this.signals.animate.dispatch(this, "out")
                    },
                    onCompleteScope: this
                })
            }, Button.prototype.animateDown = function() {
                return TweenMax.to(this.scale, .14, {
                    x: this.defaultScale.x * this.animateDownScale.x,
                    y: this.defaultScale.y * this.animateDownScale.y,
                    ease: Back.easeOut,
                    easeParams: [1],
                    onComplete: function() {
                        this.signals.animate.dispatch(this, "down")
                    },
                    onCompleteScope: this
                })
            }, Object.defineProperty(Button.prototype, "states", {
                get: function() {
                    return this._states
                }
            }), Object.defineProperty(Button.prototype, "currentNormalTexture", {
                get: function() {
                    return this._currentNormalTexture
                }
            }), Object.defineProperty(Button.prototype, "currentOverTexture", {
                get: function() {
                    return this._currentOverTexture
                }
            }), Object.defineProperty(Button.prototype, "currentDownTexture", {
                get: function() {
                    return this._currentDownTexture
                }
            }), Object.defineProperty(Button.prototype, "currentIconTexture", {
                get: function() {
                    return this._currentIconTexture
                }
            }), Object.defineProperty(Button.prototype, "enabled", {
                get: function() {
                    return this._enabled
                },
                set: function(value) {
                    this._enabled = value, this._currentNormalTexture = value || !this._states.normalInactive ? this._states.normal : this._states.normalInactive, this._currentOverTexture = value || !this._states.overInactive ? this._states.over : this._states.overInactive, this._currentDownTexture = value || !this._states.downInactive ? this._states.down : this._states.downInactive, this._currentIconTexture = value || !this._states.iconInactive ? this._states.icon : this._states.iconInactive, this._currentIconOverTexture = value || !this._states.iconOverInactive ? this._states.iconOver : this._states.iconOverInactive, this._currentIconDownTexture = value || !this._states.iconDownInactive ? this._states.iconDown : this._states.iconDownInactive, this._currentNormalTexture && (this._background.texture = this._currentNormalTexture), this._currentIconTexture && (this._icon.texture = this._currentIconTexture)
                }
            }), Object.defineProperty(Button.prototype, "tint", {
                get: function() {
                    return this._background.tint
                },
                set: function(value) {
                    this._background.tint = value, this._icon.tint = value
                }
            })
        }, {
            "./../utils/Device": 44,
            "./ButtonStates": 14
        }],
        14: [function(require, module, exports) {
            "use strict";

            function ButtonStates(normal, over, down, icon) {
                this.normal = normal, this.over = over || null, this.down = down || null, this.icon = icon || null, this.iconOver = null, this.iconDown = null, this.normalAlt = null, this.overAlt = null, this.downAlt = null, this.downAlt = null, this.iconAlt = null, this.iconOverAlt = null, this.iconDownAlt = null, this.normalInactive = null, this.overInactive = null, this.downInactive = null, this.iconInactive = null, this.iconOverInactive = null, this.iconDownInactive = null, this.normalInactiveAlt = null, this.overInactiveAlt = null, this.downInactiveAlt = null, this.iconInactiveAlt = null
            }
            module.exports = ButtonStates
        }, {}],
        15: [function(require, module, exports) {
            "use strict";

            function MovieClip(sequence, defaultAnimation) {
                this.defaultAnimation = defaultAnimation || "default", this.animationSpeed = 24, this.playing = !1, this.looping = !1, this.signals = {}, this.signals.animation = new signals.Signal, this.signals.animationComplete = new signals.Signal, this._frames = {}, this._currentFrame = 0, this._lastFrame = 0, this._currentAnimationName = this.defaultAnimation;
                var texture = sequence.textures[this.defaultAnimation] ? sequence.textures[this.defaultAnimation][0] : PIXI.Texture.EMPTY;
                if (!texture) throw new Error("No default texture found!");
                for (var key in sequence.textures)
                    if (sequence.textures.hasOwnProperty(key)) {
                        this._frames[key] = [];
                        for (var i = 0; i < sequence.textures[key].length; ++i) this._frames[key].push({
                            texture: sequence.textures[key][i],
                            callback: null,
                            scope: null
                        })
                    }
                AdditiveSprite.call(this, texture)
            }
            var AdditiveSprite = require("./AdditiveSprite");
            require("./MovieClipSequence");
            module.exports = MovieClip, MovieClip.prototype = Object.create(AdditiveSprite.prototype), MovieClip.prototype.constructor = MovieClip, MovieClip.prototype.destroy = function() {
                this.signals.animation.dispose(), this.signals.animationComplete.dispose()
            }, MovieClip.prototype.dispose = MovieClip.prototype.destroy, MovieClip.prototype.play = function(looping) {
                "boolean" == typeof looping && (this.looping = looping), this.playing = !0
            }, MovieClip.prototype.stop = function(looping) {
                "boolean" == typeof looping && (this.looping = looping), this.playing = !1
            }, MovieClip.prototype.gotoAndPlay = function(frame, looping) {
                "string" != typeof frame ? this._currentFrame = this._lastFrame = frame : this._frames[frame] && (this._currentFrame = this._lastFrame = 0, this._currentAnimationName = frame), "boolean" == typeof looping && (this.looping = looping), this.playing = !0
            }, MovieClip.prototype.gotoAndStop = function(frame, looping) {
                "string" != typeof frame ? this._currentFrame = frame : this._frames[frame] && (this._currentFrame = 0, this._currentAnimationName = frame), "boolean" == typeof looping && (this.looping = looping), this.playing = !1;
                var frames = this._frames[this._currentAnimationName],
                    round = this._currentFrame + .5 | 0;
                this.texture = frames[round % frames.length].texture
            }, MovieClip.prototype.addFrameScript = function(name, frame, callback, scope) {
                scope = scope || window, this._frames[name] && (this._frames[name][frame].callback = callback, this._frames[name][frame].scope = callback ? scope : null)
            }, MovieClip.prototype.updateTransform = function() {
                if (PIXI.Sprite.prototype.updateTransform.call(this), this.playing && this.totalFrames) {
                    this._currentFrame += this.animationSpeed * p3.Timestep.deltaTime;
                    var frames = this._frames[this._currentAnimationName],
                        round = this._currentFrame + .5 | 0,
                        index = round % (frames.length + 1);
                    this._currentFrame = this._currentFrame % frames.length, index > 0 && index != this._lastFrame && (this._lastFrame = index, frames[index - 1].callback && setTimeout(function() {
                        frames[index - 1].callback.call(frames[index - 1].scope)
                    }, 0)), this.looping || round < frames.length ? (this.texture = frames[round % frames.length].texture, round >= frames.length - 1 && p3.Timestep.queueCall(this.signals.animation.dispatch, [this._currentAnimationName])) : round >= frames.length - 1 && (this.gotoAndStop(frames.length - 1), p3.Timestep.queueCall(this.signals.animationComplete.dispatch, [this._currentAnimationName]))
                }
            }, Object.defineProperty(MovieClip.prototype, "currentFrame", {
                get: function() {
                    return this._currentFrame
                }
            }), Object.defineProperty(MovieClip.prototype, "currentAnimationFrame", {
                get: function() {
                    return this._currentAnimationName
                }
            }), Object.defineProperty(MovieClip.prototype, "totalFrames", {
                get: function() {
                    var frames = this._frames[this.defaultAnimation];
                    return frames ? frames.length : 0
                }
            })
        }, {
            "./AdditiveSprite": 12,
            "./MovieClipSequence": 16
        }],
        16: [function(require, module, exports) {
            "use strict";

            function MovieClipSequence(textures, name) {
                this.textures = {}, textures && this.addTextures(textures, name)
            }
            module.exports = MovieClipSequence, MovieClipSequence.prototype.addTextures = function(textures, name) {
                name = name || "default", this.textures[name] = textures
            }, MovieClipSequence.prototype.removeTextures = function(name) {
                name = name || "default", this.textures[name] = null
            }, MovieClipSequence.prototype.removeAllTextures = function() {
                this.textures = {}
            }
        }, {}],
        17: [function(require, module, exports) {
            "use strict";

            function MuteButton(states) {
                Button.call(this, states)
            }
            var Button = require("./Button");
            require("./ButtonStates");
            module.exports = MuteButton, MuteButton.prototype = Object.create(Button.prototype), MuteButton.prototype.constructor = MuteButton, MuteButton.prototype.onMouseClick = function(event) {
                this._currentIconTexture = this.isEnabled() ? this._states.iconAlt : this._states.icon, this._currentIconOverTexture = this.isEnabled() ? this._states.iconOverAlt : this._states.iconOver, this._currentIconDownTexture = this.isEnabled() ? this._states.iconDownAlt : this._states.iconDown, this._icon.texture = this._states.iconOver && !p3.Device.isMobile ? this._currentIconOverTexture : this._currentIconTexture, Button.audio && Button.audio.mute(!Button.audio.isMute), Button.prototype.onMouseClick.call(this, event)
            }, MuteButton.prototype.isEnabled = function() {
                return !!Button.audio && !Button.audio.isMute
            }
        }, {
            "./Button": 13,
            "./ButtonStates": 14
        }],
        18: [function(require, module, exports) {
            "use strict";

            function ToggleButton(states) {
                this._enabled = !1, Button.call(this, states)
            }
            var Button = require("./Button");
            require("./ButtonStates");
            module.exports = ToggleButton, ToggleButton.prototype = Object.create(Button.prototype), ToggleButton.prototype.constructor = ToggleButton, ToggleButton.prototype.onMouseDown = function(event) {
                this._enabled = !this._enabled, this._currentNormalTexture = this.isEnabled() ? this._states.normalAlt : this._states.normal, this._currentOverTexture = this.isEnabled() ? this._states.overAlt : this._states.over, this._currentDownTexture = this.isEnabled() ? this._states.downAlt : this._states.down, this._currentIconTexture = this.isEnabled() ? this._states.iconAlt : this._states.icon, this._currentIconOverTexture = this.isEnabled() ? this._states.iconOverAlt : this._states.iconOver, this._currentIconDownTexture = this.isEnabled() ? this._states.iconDownAlt : this._states.iconDown, Button.prototype.onMouseDown.call(this, event)
            }, ToggleButton.prototype.isEnabled = function() {
                return this._enabled
            }
        }, {
            "./Button": 13,
            "./ButtonStates": 14
        }],
        19: [function(require, module, exports) {
            "use strict";

            function CutoutShader(texture, scale, ratio) {
                scale = scale || .5, ratio = ratio || new PIXI.Point(1, 1), PIXI.Filter.call(this, null, "precision highp float;varying vec2 vTextureCoord;varying vec4 vColor;uniform sampler2D uCutoutMap;uniform float uScale;uniform vec2 uRatio;void main(void) {vec2 textureCoord  = (((vTextureCoord - vec2(0.5, 0.5)) * uRatio) * uScale) + vec2(0.5, 0.5);vec4 mask          = texture2D(uCutoutMap, textureCoord);float alpha        = 1.0 - mask.a;gl_FragColor       = vec4(vColor.r * alpha, vColor.g * alpha, vColor.b * alpha, vColor.a * alpha);}", {
                    uCutoutMap: {
                        type: "sampler2D",
                        value: texture
                    },
                    uScale: {
                        type: "f",
                        value: 1 / Math.max(.001, scale)
                    },
                    uRatio: {
                        type: "v2",
                        value: {
                            x: ratio.x,
                            y: ratio.y
                        }
                    }
                }), texture.baseTexture.isPowerOfTwo = !1
            }
            module.exports = CutoutShader, CutoutShader.prototype = Object.create(PIXI.Filter.prototype), CutoutShader.prototype.constructor = CutoutShader, Object.defineProperty(CutoutShader.prototype, "scale", {
                get: function() {
                    return 1 / this.uniforms.uScale.value
                },
                set: function(value) {
                    this.uniforms.uScale.value = 1 / Math.max(.001, value)
                }
            }), Object.defineProperty(CutoutShader.prototype, "ratio", {
                get: function() {
                    return new PIXI.Point(this.uniforms.uRatio.value.x, this.uniforms.uRatio.value.y)
                },
                set: function(value) {
                    this.uniforms.uRatio.value.x = value.x, this.uniforms.uRatio.value.y = value.y
                }
            })
        }, {}],
        20: [function(require, module, exports) {
            "use strict";

            function DesaturationFilter(strength, red, green, blue) {
                red = void 0 != red ? red : .3, green = void 0 != green ? green : .59, blue = void 0 != blue ? blue : .11, PIXI.Filter.call(this, null, ["precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float uStrength;", "uniform vec3 uRatio;", "void main (void) {", "vec4 color = texture2D(uSampler, vTextureCoord);", "if (uStrength > 0.0) {", "float intensity     = uRatio.x * color.x + uRatio.y * color.y + uRatio.z * color.z;", "color.x             = intensity * uStrength + color.x * (1.0 - uStrength);", "color.y             = intensity * uStrength + color.y * (1.0 - uStrength);", "color.z             = intensity * uStrength + color.z * (1.0 - uStrength);", "}", "gl_FragColor = color;", "}"].join("\n"), {
                    uStrength: {
                        type: "1f",
                        value: strength
                    },
                    uRatio: {
                        type: "3fv",
                        value: [red, green, blue]
                    }
                })
            }
            module.exports = DesaturationFilter, DesaturationFilter.prototype = Object.create(PIXI.Filter.prototype), DesaturationFilter.prototype.constructor = DesaturationFilter, Object.defineProperty(DesaturationFilter.prototype, "strength", {
                get: function() {
                    return this.uniforms.uStrength
                },
                set: function(value) {
                    this.uniforms.uStrength = value
                }
            }), Object.defineProperty(DesaturationFilter.prototype, "red", {
                get: function() {
                    return this.uniforms.uRatio[0]
                },
                set: function(value) {
                    this.uniforms.uRatio[0] = value
                }
            }), Object.defineProperty(DesaturationFilter.prototype, "green", {
                get: function() {
                    return this.uniforms.uRatio[1]
                },
                set: function(value) {
                    this.uniforms.uRatio[1] = value
                }
            }), Object.defineProperty(DesaturationFilter.prototype, "blue", {
                get: function() {
                    return this.uniforms.uRatio[2]
                },
                set: function(value) {
                    this.uniforms.uRatio[2] = value
                }
            })
        }, {}],
        21: [function(require, module, exports) {
            "use strict";

            function DistortionFilter(amplitude, frequency) {
                PIXI.Filter.call(this, null, ["precision highp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float uTime;", "uniform float uAmplitude;", "uniform float uFrequency;", "void main(void) {", "float t        = uFrequency != 0.0 ? uTime + (gl_FragCoord.y / uFrequency) : 0.0;", "vec2 coord     = vec2(vTextureCoord.x + sin(t) * uAmplitude, vTextureCoord.y);", "vec4 diffuse   = texture2D(uSampler, coord);", "gl_FragColor   = diffuse;", "}"].join("\n"), {
                    uTime: {
                        type: "1f",
                        value: 0
                    },
                    uAmplitude: {
                        type: "1f",
                        value: 0
                    },
                    uFrequency: {
                        type: "1f",
                        value: 0
                    }
                }), this.amplitude = "number" == typeof amplitude ? amplitude : .2, this.frequency = "number" == typeof frequency ? frequency : 2
            }
            module.exports = DistortionFilter, DistortionFilter.prototype = Object.create(PIXI.Filter.prototype), DistortionFilter.prototype.constructor = DistortionFilter, Object.defineProperty(DistortionFilter.prototype, "time", {
                get: function() {
                    return this.uniforms.uTime
                },
                set: function(value) {
                    this.uniforms.uTime = value
                }
            }), Object.defineProperty(DistortionFilter.prototype, "amplitude", {
                get: function() {
                    return 20 * this.uniforms.uAmplitude
                },
                set: function(value) {
                    this.uniforms.uAmplitude = value / 20
                }
            }), Object.defineProperty(DistortionFilter.prototype, "frequency", {
                get: function() {
                    return this.uniforms.uFrequency
                },
                set: function(value) {
                    this.uniforms.uFrequency = value
                }
            })
        }, {}],
        22: [function(require, module, exports) {
            var p3 = window.p3 || {};
            p3.AudioManager = require("./audio/AudioManager"), p3.Camera = require("./camera/Camera"), p3.CameraLayer = require("./camera/CameraLayer"), p3.CameraParallax = require("./camera/CameraParallax"), p3.AdditiveSprite = require("./display/AdditiveSprite"), p3.Button = require("./display/Button"), p3.ButtonStates = require("./display/ButtonStates"), p3.MovieClip = require("./display/MovieClip"), p3.MovieClipSequence = require("./display/MovieClipSequence"), p3.MuteButton = require("./display/MuteButton"), p3.ToggleButton = require("./display/ToggleButton"), p3.CutoutShader = require("./effects/CutoutShader"), p3.DesaturationFilter = require("./effects/DesaturationFilter"), p3.DistortionFilter = require("./effects/DistortionFilter"), p3.RandomSeed = require("./math/RandomSeed"), p3.Vector2 = require("./math/Vector2"), p3.Tracking = require("./tracking/Tracking"), p3.TrackingData = require("./tracking/TrackingData"), p3.TrackingDataBBCAction = require("./tracking/TrackingDataBBCAction"), p3.TrackingDataBBCAction = require("./tracking/TrackingDataEcho"), p3.TrackingDataGoogleEvent = require("./tracking/TrackingDataGoogleEvent"), p3.TrackingDataGooglePage = require("./tracking/TrackingDataGooglePage"), p3.TrackingDataPlaydom = require("./tracking/TrackingDataPlaydom"), p3.TrackingDataPlaydomDeviceInfo = require("./tracking/TrackingDataPlaydomDeviceInfo"), p3.TrackingDataPlaydomGameAction = require("./tracking/TrackingDataPlaydomGameAction"), p3.TrackingDataPlaydomNavigationAction = require("./tracking/TrackingDataPlaydomNavigationAction"), p3.TrackingModule = require("./tracking/TrackingModule"), p3.TrackingModuleBBC = require("./tracking/TrackingModuleBBC"), p3.TrackingModuleEcho = require("./tracking/TrackingModuleEcho"), p3.TrackingModuleGoogle = require("./tracking/TrackingModuleGoogle"), p3.TrackingModulePlaydom = require("./tracking/TrackingModulePlaydom"), p3.CutoutTransition = require("./transitions/CutoutTransition"), p3.FadeTransition = require("./transitions/FadeTransition"), p3.Transition = require("./transitions/Transition"), p3.Color = require("./utils/Color"), p3.Device = require("./utils/Device"), p3.ObjectPool = require("./utils/ObjectPool"), p3.Sorting = require("./utils/Sorting"), p3.Timer = require("./utils/Timer"), p3.Utils = require("./utils/Utils"), p3.Animator = require("./Animator"), p3.AssetManager = require("./AssetManager"), p3.Scene = require("./Scene"), p3.SceneManager = require("./SceneManager"), p3.Timestep = require("./Timestep"), p3.View = require("./View"), p3.ViewParams = require("./ViewParams"), window.p3 = p3
        }, {
            "./Animator": 1,
            "./AssetManager": 2,
            "./Scene": 3,
            "./SceneManager": 4,
            "./Timestep": 5,
            "./View": 6,
            "./ViewParams": 7,
            "./audio/AudioManager": 8,
            "./camera/Camera": 9,
            "./camera/CameraLayer": 10,
            "./camera/CameraParallax": 11,
            "./display/AdditiveSprite": 12,
            "./display/Button": 13,
            "./display/ButtonStates": 14,
            "./display/MovieClip": 15,
            "./display/MovieClipSequence": 16,
            "./display/MuteButton": 17,
            "./display/ToggleButton": 18,
            "./effects/CutoutShader": 19,
            "./effects/DesaturationFilter": 20,
            "./effects/DistortionFilter": 21,
            "./math/RandomSeed": 23,
            "./math/Vector2": 24,
            "./tracking/Tracking": 25,
            "./tracking/TrackingData": 26,
            "./tracking/TrackingDataBBCAction": 27,
            "./tracking/TrackingDataEcho": 28,
            "./tracking/TrackingDataGoogleEvent": 29,
            "./tracking/TrackingDataGooglePage": 30,
            "./tracking/TrackingDataPlaydom": 31,
            "./tracking/TrackingDataPlaydomDeviceInfo": 32,
            "./tracking/TrackingDataPlaydomGameAction": 33,
            "./tracking/TrackingDataPlaydomNavigationAction": 34,
            "./tracking/TrackingModule": 35,
            "./tracking/TrackingModuleBBC": 36,
            "./tracking/TrackingModuleEcho": 37,
            "./tracking/TrackingModuleGoogle": 38,
            "./tracking/TrackingModulePlaydom": 39,
            "./transitions/CutoutTransition": 40,
            "./transitions/FadeTransition": 41,
            "./transitions/Transition": 42,
            "./utils/Color": 43,
            "./utils/Device": 44,
            "./utils/ObjectPool": 45,
            "./utils/Sorting": 46,
            "./utils/Timer": 47,
            "./utils/Utils": 48
        }],
        23: [function(require, module, exports) {
            var RandomSeed = function() {
                this.seed = 1
            };
            module.exports = RandomSeed, RandomSeed.prototype.nextInt = function() {
                return this._gen();
            }, RandomSeed.prototype.nextDouble = function() {
                return this._gen() / 2147483647
            }, RandomSeed.prototype.nextIntRange = function(min, max) {
                return min -= .4999, max += .4999, Math.abs(Math.round(min + (max - min) * this.nextDouble()))
            }, RandomSeed.prototype.nextDoubleRange = function(min, max) {
                return min + (max - min) * this.nextDouble()
            }, RandomSeed.prototype._gen = function() {
                return Math.abs(this.seed = 16807 * this.seed % 2147483647)
            }
        }, {}],
        24: [function(require, module, exports) {
            "use strict";

            function Vector2(x, y) {
                this.x = x || 0, this.y = y || 0
            }
            module.exports = Vector2, Vector2.VERSION = "1.0.1", Vector2.prototype.add = function(vector) {
                return new p3.Vector2(this.x + vector.x, this.y + vector.y)
            }, Vector2.prototype.subtract = function(vector) {
                return new p3.Vector2(this.x - vector.x, this.y - vector.y)
            }, Vector2.prototype.scale = function(scalar) {
                return new p3.Vector2(this.x * scalar, this.y * scalar)
            }, Vector2.prototype.incrementBy = function(vector) {
                this.x = this.x + vector.x, this.y = this.y + vector.y
            }, Vector2.prototype.decrementBy = function(vector) {
                this.x = this.x - vector.x, this.y = this.y - vector.y
            }, Vector2.prototype.scaleBy = function(scalar) {
                this.x = this.x * scalar, this.y = this.y * scalar
            }, Vector2.prototype.normalize = function(length) {
                var l = this.length;
                l > 0 && (this.x = this.x / l * length, this.y = this.y / l * length)
            }, Vector2.prototype.truncate = function(length) {
                var l = this.length;
                l > length && (this.x = this.x / l * length, this.y = this.y / l * length)
            }, Vector2.prototype.dotProduct = function(vector) {
                return this.x * vector.x + this.y * vector.y
            }, Vector2.prototype.perpProduct = function(vector) {
                return -this.y * vector.x + this.x * vector.y
            }, Vector2.prototype.clone = function() {
                return new p3.Vector2(this.x, this.y)
            }, Object.defineProperty(Vector2.prototype, "length", {
                get: function() {
                    return Math.sqrt(this.x * this.x + this.y * this.y)
                }
            }), Object.defineProperty(Vector2.prototype, "lengthSq", {
                get: function() {
                    return this.x * this.x + this.y * this.y
                }
            }), Object.defineProperty(Vector2.prototype, "unit", {
                get: function() {
                    var length = this.length;
                    return new p3.Vector2(this.x / length, this.y / length)
                }
            })
        }, {}],
        25: [function(require, module, exports) {
            "use strict";

            function Tracking() {
                this._module = null
            }
            module.exports = Tracking, Tracking.DEBUG = !1, Tracking.prototype.init = function(module) {
                this._module = module
            }, Tracking.prototype.track = function(data) {
                this._module.track(data), Tracking.DEBUG && console.log("Track sent - ", data)
            }
        }, {}],
        26: [function(require, module, exports) {
            "use strict";

            function TrackingData() {}
            module.exports = TrackingData
        }, {}],
        27: [function(require, module, exports) {
            "use strict";

            function TrackingDataBBCAction(name, type, params) {
                TrackingData.call(this), this._name = name, this._type = type, this._params = params
            }
            var TrackingData = require("./TrackingData");
            module.exports = TrackingDataBBCAction, TrackingDataBBCAction.prototype = Object.create(TrackingData), TrackingDataBBCAction.prototype.constructor = TrackingDataBBCAction, Object.defineProperty(TrackingDataBBCAction.prototype, "name", {
                get: function() {
                    return this._name
                }
            }), Object.defineProperty(TrackingDataBBCAction.prototype, "type", {
                get: function() {
                    return this._type
                }
            }), Object.defineProperty(TrackingDataBBCAction.prototype, "params", {
                get: function() {
                    return this._params
                }
            })
        }, {
            "./TrackingData": 26
        }],
        28: [function(require, module, exports) {
            "use strict";

            function TrackingDataEcho(name, type, params) {
                TrackingData.call(this), this._name = name, this._type = type, this._params = params
            }
            var TrackingData = require("./TrackingData");
            module.exports = TrackingDataEcho, TrackingDataEcho.prototype = Object.create(TrackingData.prototype), TrackingDataEcho.prototype.constructor = TrackingDataEcho, Object.defineProperty(TrackingDataEcho.prototype, "name", {
                get: function() {
                    return this._name
                }
            }), Object.defineProperty(TrackingDataEcho.prototype, "type", {
                get: function() {
                    return this._type
                }
            }), Object.defineProperty(TrackingDataEcho.prototype, "params", {
                get: function() {
                    return this._params
                }
            })
        }, {
            "./TrackingData": 26
        }],
        29: [function(require, module, exports) {
            "use strict";

            function TrackingDataGoogleEvent(category, action, label, value) {
                this.category = category, this.action = action, this.label = label, this.value = value
            }
            var TrackingData = require("./TrackingData");
            require("./TrackingModuleGoogle");
            module.exports = TrackingDataGoogleEvent, TrackingDataGoogleEvent.prototype = Object.create(TrackingData), TrackingDataGoogleEvent.prototype.constructor = TrackingDataGoogleEvent
        }, {
            "./TrackingData": 26,
            "./TrackingModuleGoogle": 38
        }],
        30: [function(require, module, exports) {
            "use strict";

            function TrackingDataGooglePage(page) {
                this.page = page
            }
            var TrackingData = require("./TrackingData");
            require("./TrackingModuleGoogle");
            module.exports = TrackingDataGooglePage, TrackingDataGooglePage.prototype = Object.create(TrackingData), TrackingDataGooglePage.prototype.constructor = TrackingDataGooglePage
        }, {
            "./TrackingData": 26,
            "./TrackingModuleGoogle": 38
        }],
        31: [function(require, module, exports) {
            "use strict";

            function TrackingDataPlaydom() {
                this.tag = null
            }
            module.exports = TrackingDataPlaydom, TrackingDataPlaydom.prototype.getParams = function(object) {
                return {}
            }
        }, {}],
        32: [function(require, module, exports) {
            "use strict";

            function TrackingDataPlaydomDeviceInfo(machine, model, osVersion, mToken, deviceId, iosVendorId, iosAdvertisingId, googAdvertisingId) {
                this.tag = "device_info", this.machine = machine || "NULL", this.model = model || "NULL", this.osVersion = osVersion || "NULL", this.mToken = mToken || "NULL", this.deviceId = deviceId || "NULL", this.iosVendorId = iosVendorId || "NULL", this.iosAdvertisingId = iosAdvertisingId || "NULL", this.googAdvertisingId = googAdvertisingId || "NULL"
            }
            var TrackingDataPlaydom = require("./TrackingDataPlaydom");
            module.exports = TrackingDataPlaydomDeviceInfo, TrackingDataPlaydomDeviceInfo.prototype = Object.create(TrackingDataPlaydom.prototype), TrackingDataPlaydomDeviceInfo.prototype.constructor = TrackingDataPlaydomDeviceInfo, TrackingDataPlaydomDeviceInfo.prototype.getParams = function(object) {
                return object = object || {}, object.tag = this.tag, object.machine = this.machine, object.model = this.model, object.osVersion = this.osVersion, object.mToken = this.mToken, object.deviceId = this.deviceId, object.iosVendorId = this.iosVendorId, object.iosAdvertisingId = this.iosAdvertisingId, object.googAdvertisingId = this.googAdvertisingId, object
            }
        }, {
            "./TrackingDataPlaydom": 31
        }],
        33: [function(require, module, exports) {
            "use strict";

            function TrackingDataPlaydomGameAction(context, action, message) {
                this.tag = "game_action", this.context = context, this.action = action, this.message = message
            }
            var TrackingDataPlaydom = require("./TrackingDataPlaydom");
            module.exports = TrackingDataPlaydomGameAction, TrackingDataPlaydomGameAction.prototype = Object.create(TrackingDataPlaydom.prototype), TrackingDataPlaydomGameAction.prototype.constructor = TrackingDataPlaydomGameAction, TrackingDataPlaydomGameAction.prototype.getParams = function(object) {
                return object = object || {}, object.tag = this.tag, object.context = this.context, object.action = this.action, object.message = this.message, object
            }
        }, {
            "./TrackingDataPlaydom": 31
        }],
        34: [function(require, module, exports) {
            "use strict";

            function TrackingDataPlaydomNavigationAction(context, action) {
                this.tag = "navigation_action", this.context = context, this.action = action
            }
            var TrackingDataPlaydom = require("./TrackingDataPlaydom");
            module.exports = TrackingDataPlaydomNavigationAction, TrackingDataPlaydomNavigationAction.prototype = Object.create(TrackingDataPlaydom.prototype), TrackingDataPlaydomNavigationAction.prototype.constructor = TrackingDataPlaydomNavigationAction, TrackingDataPlaydomNavigationAction.prototype.getParams = function(object) {
                return object = object || {}, object.tag = this.tag, object.context = this.context, object.action = this.action, object
            }
        }, {
            "./TrackingDataPlaydom": 31
        }],
        35: [function(require, module, exports) {
            "use strict";

            function TrackingModule() {}
            module.exports = TrackingModule, TrackingModule.track = function(data) {}, TrackingModule.isScriptFound = function() {
                return !1
            }
        }, {}],
        36: [function(require, module, exports) {
            "use strict";

            function TrackingModuleBBC(library, gameName, environment, counterName, devTag) {
                this.window = window.top || window, TrackingModuleBBC.DEV_lib = this.trackingLib = library, this.isScriptFound() && (devTag ? TrackingModuleBBC.DEV_statsLogger = this.statsLogger = this.trackingLib.create(gameName, environment, counterName, devTag) : TrackingModuleBBC.DEV_statsLogger = this.statsLogger = this.trackingLib.create(gameName, environment, counterName))
            }
            var TrackingModule = require("./TrackingModule");
            module.exports = TrackingModuleBBC, TrackingModuleBBC.prototype = Object.create(TrackingModule), TrackingModuleBBC.prototype.constructor = TrackingModuleBBC, TrackingModuleBBC.DEV_lib = null, TrackingModuleBBC.DEV_statsLogger = null, TrackingModuleBBC.TYPE_PAGE = "page", TrackingModuleBBC.TYPE_EVENT = "event", TrackingModuleBBC.prototype.track = function(data) {
                this.isScriptFound() && (!data || !data.action_name || !data.action_type, this.statsLogger.logAction(data.action_name, data.action_type, data.params)), data.action_name = null, data.action_type = null, data.params = null, data = null
            }, TrackingModuleBBC.prototype.isScriptFound = function() {
                return !!this.trackingLib
            }
        }, {
            "./TrackingModule": 35
        }],
        37: [function(require, module, exports) {
            "use strict";

            function TrackingModuleEcho() {
                TrackingModule.call(this)
            }
            var TrackingModule = require("./TrackingModule");
            module.exports = TrackingModuleEcho, TrackingModuleEcho.prototype = Object.create(TrackingModule.prototype), TrackingModuleEcho.prototype.constructor = TrackingModuleEcho, TrackingModuleEcho.prototype.track = function(data) {
                window.stats && window.stats.logUserActionEvent(data.name, data.type, data.params)
            }
        }, {
            "./TrackingModule": 35
        }],
        38: [function(require, module, exports) {
            "use strict";

            function TrackingModuleGoogle(code, site) {
                this.window = window.top || window, this.isScriptFound() && this.window.ga("create", code, site)
            }
            var TrackingModule = require("./TrackingModule"),
                TrackingDataGoogleEvent = require("./TrackingDataGoogleEvent"),
                TrackingDataGooglePage = require("./TrackingDataGooglePage");
            module.exports = TrackingModuleGoogle, TrackingModuleGoogle.prototype = Object.create(TrackingModule), TrackingModuleGoogle.prototype.constructor = TrackingModuleGoogle, TrackingModuleGoogle.prototype.track = function(data) {
                this.isScriptFound() && (data instanceof TrackingDataGooglePage ? this.window.ga("send", {
                    hitType: "pageview",
                    page: "/" + data.page,
                    title: data.page
                }) : data instanceof TrackingDataGoogleEvent && this.window.ga("send", {
                    hitType: "event",
                    eventCategory: data.category,
                    eventAction: data.action,
                    eventLabel: data.label,
                    eventValue: data.value
                }))
            }, TrackingModuleGoogle.prototype.isScriptFound = function() {
                return !!this.window.ga || (console.warn("[p3.Tracking] Google Analytics script is not found on the page."), !1)
            }
        }, {
            "./TrackingDataGoogleEvent": 29,
            "./TrackingDataGooglePage": 30,
            "./TrackingModule": 35
        }],
        39: [function(require, module, exports) {
            "use strict";

            function TrackingModulePlaydom(app, appLocale, network, viewNetwork, authorizationId) {
                this._app = app, this._appLocale = appLocale, this._network = network, this._viewNetwork = viewNetwork, this._authorizationId = authorizationId, this._browserId = window.localStorage.browserId ? window.localStorage.browserId : this.generateKey(), window.localStorage.browserId = this._browserId, this._transactionId = this.generateKey()
            }
            module.exports = TrackingModulePlaydom, TrackingModulePlaydom.prototype.track = function(data) {
                var url = "https://api.disney.com/datatech/serverlog/v1/json",
                    params = {};
                params.app = this._app, params.user_id = this._browserId, params.app_locale = this._appLocale, params.transaction_id = this._transactionId, params.browserId = this._browserId, params.network = this._network, params.view_network = this._viewNetwork;
                var str = JSON.stringify(data.getParams(params));
                console.log(str);
                var request = new XMLHttpRequest;
                request.open("POST", url, !0), request.setRequestHeader("Content-Type", "application/json"), request.setRequestHeader("Authorization", this._authorizationId), request.send(str)
            }, TrackingModulePlaydom.prototype.generateKey = function() {
                var key = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
                return key.replace(/[xy]/g, function(c) {
                    var r = 16 * Math.random() | 0,
                        v = "x" == c ? r : 3 & r | 8;
                    return v.toString(16)
                })
            }
        }, {}],
        40: [function(require, module, exports) {
            "use strict";

            function CutoutTransition(texture, color, duration) {
                this.startScale = 8, this.endScale = 0, this._texture = texture, this._color = color || 0, this._duration = duration || 2, this._cutout = null, Transition.call(this), this.requiresWebGL = !0
            }
            var CutoutShader = require("./../effects/CutoutShader"),
                FadeTransition = require("./FadeTransition"),
                Transition = require("./Transition");
            module.exports = CutoutTransition, CutoutTransition.prototype = Object.create(Transition.prototype), CutoutTransition.prototype.constructor = CutoutTransition, CutoutTransition.prototype.init = function() {
                var quad = new PIXI.Graphics;
                quad.drawRect(0, 0, 1, 1);
                var ratio = new PIXI.Point(0, 0),
                    canvasRatio = p3.Canvas.width / p3.Canvas.height,
                    textureRatio = this._texture.width / this._texture.height;
                canvasRatio / textureRatio > 1 ? (ratio.x = 1, ratio.y = 1 / (canvasRatio / textureRatio)) : (ratio.x = 1 / (canvasRatio / textureRatio), ratio.y = 1), this._cutout = new PIXI.Sprite(quad.generateTexture()), this._cutout.scale = new PIXI.Point(p3.Canvas.width, p3.Canvas.height), this._cutout.tint = this._color, this._cutout.shader = new CutoutShader(this._texture, 0, ratio), this.addChild(this._cutout)
            }, CutoutTransition.prototype["in"] = function() {
                this._cutout.shader.scale = this.startScale, TweenMax.to(this._cutout.shader, .5 * this._duration, {
                    scale: this.endScale,
                    ease: Power2.easeInOut,
                    onComplete: function() {
                        Transition.prototype["in"].call(this, this)
                    },
                    onCompleteScope: this
                })
            }, CutoutTransition.prototype.out = function() {
                this._cutout.shader.scale = this.endScale, TweenMax.to(this._cutout.shader, .5 * this._duration, {
                    scale: this.startScale,
                    ease: Power2.easeInOut,
                    onComplete: function() {
                        Transition.prototype.out.call(this, this)
                    },
                    onCompleteScope: this
                })
            }, CutoutTransition.prototype.resize = function() {
                var ratio = new PIXI.Point(0, 0),
                    canvasRatio = p3.Canvas.width / p3.Canvas.height,
                    textureRatio = this._texture.width / this._texture.height;
                canvasRatio / textureRatio > 1 ? (ratio.x = 1, ratio.y = 1 / (canvasRatio / textureRatio)) : (ratio.x = 1 / (canvasRatio / textureRatio), ratio.y = 1), this._cutout.scale = new PIXI.Point(p3.Canvas.width, p3.Canvas.height), this._cutout.shader.ratio = ratio
            }, CutoutTransition.prototype.fallback = function() {
                return new FadeTransition(this._color)
            }
        }, {
            "./../effects/CutoutShader": 19,
            "./FadeTransition": 41,
            "./Transition": 42
        }],
        41: [function(require, module, exports) {
            "use strict";

            function FadeTransition(color, duration) {
                this._color = color || 0, this._duration = duration || .8, this._quad = null, Transition.call(this)
            }
            var Transition = require("./Transition");
            module.exports = FadeTransition, FadeTransition.prototype = Object.create(Transition.prototype), FadeTransition.prototype.constructor = FadeTransition, FadeTransition.prototype.init = function() {
                this._quad = new PIXI.Graphics, this._quad.visible = !1, this._quad.beginFill(this._color), this._quad.drawRect(0, 0, p3.View.width, p3.View.height), this._quad.endFill(), this.addChild(this._quad)
            }, FadeTransition.prototype["in"] = function() {
                this._quad.alpha = 0, this._quad.visible = !0, TweenMax.to(this._quad, .5 * this._duration, {
                    alpha: 1,
                    ease: Power2.easeInOut,
                    onComplete: function() {
                        Transition.prototype["in"].call(this, this)
                    },
                    onCompleteScope: this
                })
            }, FadeTransition.prototype.out = function() {
                TweenMax.to(this._quad, .5 * this._duration, {
                    alpha: 0,
                    ease: Power2.easeInOut,
                    onComplete: function() {
                        this._quad.visible = !1, Transition.prototype.out.call(this, this)
                    },
                    onCompleteScope: this
                })
            }, FadeTransition.prototype.resize = function() {
                this._quad && (this._quad.clear(), this._quad.beginFill(this._color), this._quad.drawRect(0, 0, p3.View.width, p3.View.height), this._quad.endFill())
            }
        }, {
            "./Transition": 42
        }],
        42: [function(require, module, exports) {
            "use strict";

            function Transition() {
                this.signals = {}, this.signals["in"] = new signals.Signal, this.signals.out = new signals.Signal, this.push = !1, this.replace = !0, this.wait = !0, this.requiresWebGL = !1, PIXI.Container.call(this)
            }
            module.exports = Transition, Transition.prototype = Object.create(PIXI.Container.prototype), Transition.prototype.constructor = Transition, Transition.prototype.init = function() {}, Transition.prototype.reset = function() {
                this.signals["in"].removeAll(), this.signals.out.removeAll(), this.removeChildren()
            }, Transition.prototype.destroy = function() {
                this.signals["in"].dispose(), this.signals.out.dispose(), this.removeChildren()
            }, Transition.prototype.dispose = Transition.prototype.destroy, Transition.prototype["in"] = function() {
                this.signals["in"].dispatch(this)
            }, Transition.prototype.out = function() {
                this.signals.out.dispatch(this)
            }, Transition.prototype.resize = function() {}, Transition.prototype.fallback = function() {}
        }, {}],
        43: [function(require, module, exports) {
            "use strict";

            function Color() {}
            module.exports = Color, Color.RED = 16711680, Color.GREEN = 65280, Color.BLUE = 255, Color.WHITE = 16777215, Color.BLACK = 0, Color.lerp = function(a, b, t) {
                var from = Color.hex2rgb(a),
                    to = Color.hex2rgb(b);
                return to.r = (1 - t) * from.r + t * to.r, to.g = (1 - t) * from.g + t * to.g, to.b = (1 - t) * from.b + t * to.b, Color.rgb2hex(to.r, to.g, to.b)
            }, Color.hex2rgb = function(hex) {
                var rgb = {};
                return rgb.r = hex >> 16 & 255, rgb.g = hex >> 8 & 255, rgb.b = hex >> 0 & 255, rgb
            }, Color.rgb2hex = function(red, green, blue) {
                return red << 16 | green << 8 | blue
            }
        }, {}],
        44: [function(require, module, exports) {
            var Device = function() {};
            module.exports = Device, Device.init = function(bowser) {
                bowser || console.warn("[Device] 'bowser' not found, it much be included in the libs and added to the window.");
                var ua = navigator.userAgent;
                Device.bowser = bowser, Device._regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/), Device._resultAppleWebKitRegEx = Device._regExAppleWebKit.exec(navigator.userAgent), Device._appleWebKitVersion = null === Device._resultAppleWebKitRegEx ? null : parseFloat(Device._regExAppleWebKit.exec(navigator.userAgent)[1]), Device._webgl = function() {
                    try {
                        var canvas = document.createElement("canvas");
                        return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
                    } catch (e) {
                        return !1
                    }
                }(), Device.isMobile = bowser.mobile || bowser.tablet, Device.isLowRes = Math.max(window.innerWidth, window.innerHeight) <= 372, Device.isIOS = bowser.ios, Device.isAndroid = bowser.android, Device.isIpad = Device.isIOS && "iPad" == bowser.name, Device.isIpadMini = Device.isIOS && Device.isIpad && 1 === window.devicePixelRatio && Math.max(window.innerWidth, window.innerHeight) <= 1024, Device.isIpod = Device.isIOS && "iPod" == bowser.name, Device.isIphone = Device.isIOS && "iPhone" == bowser.name, Device.isWebGL = Device._webgl, Device.isCanvas = !Device._webgl, Device.isAndroidStockBrowser = Device.isAndroid && null !== Device._appleWebKitVersion && Device._appleWebKitVersion < 537, Device.isIOS9 = Device.isIOS && /(iphone|ipod|ipad).* os 9_/.test(navigator.userAgent.toLowerCase()), Device.isIframe = window.self !== window.top, Device.isKindle = /Kindle/i.test(ua) || /Silk/i.test(ua) || /KFTT/i.test(ua) || /KFOT/i.test(ua) || /KFJWA/i.test(ua) || /KFJWI/i.test(ua) || /KFSOWI/i.test(ua) || /KFTHWA/i.test(ua) || /KFTHWI/i.test(ua) || /KFAPWA/i.test(ua) || /KFAPWI/i.test(ua), Device.isTwitterFacebookBrowser = /(twitter|fban|fbav)/.test(navigator.userAgent.toLowerCase()), Device.isReady = !0
            }, Device.isReady = !1, Device.bowser = null, Device.isMobile = !1, Device.isIOS = !1, Device.isAndroid = !1, Device.isIpad = !1, Device.isIpod = !1, Device.isIphone = !1, Device.isIphone4 = !1, Device.isKindle = !1, Device.isLowRes = !1, Device.isWebGL = !1, Device.isCanvas = !1, Device.isAndroidStockBrowser = !1, Device.isIOS9 = !1, Device.isIframe = !1, Device.isTwitterFacebookBrowser = !1, Object.defineProperty(Device, "isCocoonJS", {
                get: function() {
                    return "undefined" != typeof navigator.isCocoonJS
                }
            })
        }, {}],
        45: [function(require, module, exports) {
            "use strict";

            function ObjectPool(base, size, args) {
                this._base = base, this._size = Math.max(1, size), this._args = args || null, this._free = [], this._used = [], this.expand(size)
            }
            module.exports = ObjectPool, ObjectPool.prototype.dispose = function() {
                for (var object, i = 0; i < this._free.length; ++i) object = this._free[i], object && object.dispose();
                for (this._free.length = 0, i = 0; i < this._used.length; ++i) object = this._used[i], object && object.dispose();
                this._used.length = 0
            }, ObjectPool.prototype.expand = function(size) {
                for (var object, i = 0; i < size; ++i) object = Object.create(this._base.prototype), object.constructor = this._base, this._base.apply(object, this._args), this._free.push(object)
            }, ObjectPool.prototype.create = function() {
                var object = this._free.shift();
                return object.init && object.init(), this._used.push(object), this._free.length ? object : null
            }, ObjectPool.prototype.free = function(object) {
                var index = this._used.indexOf(object);
                return index != -1 && (object.reset && object.reset(), this._free.push(object), this._used.splice(index, 1)), index != -1
            }, Object.defineProperty(ObjectPool.prototype, "size", {
                get: function() {
                    return this._size
                }
            }), Object.defineProperty(ObjectPool.prototype, "available", {
                get: function() {
                    return this._free.length
                }
            })
        }, {}],
        46: [function(require, module, exports) {
            var Sorting = function() {};
            module.exports = Sorting;
            Sorting.prototype;
            Sorting.quickSort = function(array, left, right) {
                function partition(array, left, right) {
                    for (var temp, pivot = array[left + right >>> 1]; left <= right;) {
                        for (; array[left] < pivot;) left++;
                        for (; array[right] > pivot;) right--;
                        left <= right && (temp = array[left], array[left++] = array[right], array[right--] = temp)
                    }
                    return left
                }
                var middle = partition(array, left, right);
                return left < middle - 1 && Sorting.quickSort(array, left, middle - 1), right > middle && Sorting.quickSort(array, middle, right), array
            }, Sorting.quickSortProperty = function(array, left, right, property) {
                function partition(array, left, right) {
                    for (var temp, pivot = array[left + right >>> 1]; left <= right;) {
                        for (; array[left][property] < pivot[property];) left++;
                        for (; array[right][property] > pivot[property];) right--;
                        left <= right && (temp = array[left], array[left++] = array[right], array[right--] = temp)
                    }
                    return left
                }
                var middle = partition(array, left, right);
                return left < middle - 1 && Sorting.quickSortProperty(array, left, middle - 1, property), right > middle && Sorting.quickSortProperty(array, middle, right, property), array
            }, Sorting.insertionSort = function(array) {
                var value, i, j, len = array.length;
                for (i = 0; i < len; i++) {
                    for (value = array[i], j = i - 1; j > -1 && array[j] > value; j--) array[j + 1] = array[j];
                    array[j + 1] = value
                }
                return array
            }, Sorting.insertionSortProperty = function(array, property) {
                var value, i, j, len = array.length;
                for (i = 0; i < len; i++) {
                    for (value = array[i], j = i - 1; j > -1 && array[j][property] > value[property]; j--) array[j + 1] = array[j];
                    array[j + 1] = value
                }
                return array
            }, Sorting.bubbleSort = function(array) {
                var i, j, len, temp;
                for (i = 0, len = array.length; i < len; i++)
                    for (j = i + 1; j < len; j++) array[i] > array[j] && (temp = array[i], array[i] = array[j], array[j] = temp);
                return array
            }, Sorting.bubbleSortProperty = function(array, property) {
                var i, j, len, temp;
                for (i = 0, len = array.length; i < len; i++)
                    for (j = i + 1; j < len; j++) array[i][property] > array[j][property] && (temp = array[i], array[i] = array[j], array[j] = temp);
                return array
            }, Sorting.test = function(numOfObjects, numOfIterations) {
                var start, returnedArray, i, numbericalArr = [],
                    propertyArr = [];
                for (numOfObjects = numOfObjects || 100, numOfIterations = numOfIterations || 1e4, i = 0; i < numOfObjects; i++) numbericalArr.push(Math.round(1e3 * Math.random()));
                for (i = 0; i < numOfObjects; i++) {
                    var obj = {};
                    obj.y = Math.round(1e3 * Math.random()), propertyArr.push(obj)
                }
                for (DEBUG && console.log("//////////////////////"), DEBUG && console.log("/////// SIMPLE ///////"), DEBUG && console.log("////////////////////// "), DEBUG && console.log("\n"), start = new Date, i = 0; i < numOfIterations; i++) returnedArray = Sorting.bubbleSort(numbericalArr.slice(0));
                for (DEBUG && console.log("Bubble:", new Date - start, ":", returnedArray, "\n"), start = new Date, i = 0; i < numOfIterations; i++) returnedArray = Sorting.quickSort(numbericalArr.slice(0), 0, numbericalArr.length - 1);
                for (DEBUG && console.log("Quick:", new Date - start, ":", returnedArray, "\n"), start = new Date, i = 0; i < numOfIterations; i++) returnedArray = Sorting.insertionSort(numbericalArr.slice(0));
                for (DEBUG && console.log("Insertion:", new Date - start, ":", returnedArray, "\n"), DEBUG && console.log("\n"), DEBUG && console.log("//////////////////////"), DEBUG && console.log("////// PROPERTY //////"), DEBUG && console.log("//////////////////////"), DEBUG && console.log("\n"), start = new Date, i = 0; i < numOfIterations; i++) returnedArray = Sorting.bubbleSortProperty(propertyArr.slice(0), "y");
                for (DEBUG && console.log("Bubble:", new Date - start, ":", returnedArray, "\n"), start = new Date, i = 0; i < numOfIterations; i++) returnedArray = Sorting.quickSortProperty(propertyArr.slice(0), 0, propertyArr.length - 1, "y");
                for (DEBUG && console.log("Quick:", new Date - start, ":", returnedArray, "\n"), start = new Date, i = 0; i < numOfIterations; i++) returnedArray = Sorting.insertionSortProperty(propertyArr.slice(0), "y");
                DEBUG && console.log("Insertion:", new Date - start, ":", returnedArray, "\n")
            }
        }, {}],
        47: [function(require, module, exports) {
            "use strict";

            function Timer(delay, repeatCount) {
                this.currentCount = 0, this.delay = delay, this.timeLeft = this.delay, this.repeatCount = Math.max(0, repeatCount) || 0, this.removeOnComplete = !0, this.signals = {}, this.signals.timer = new signals.Signal, this.signals.timerComplete = new signals.Signal, this._running = !1, this._invalid = !1
            }
            var Timestep = require("./../Timestep");
            module.exports = Timer, Timer.s2ms = function(s) {
                return 1e3 * s
            }, Timer.ms2s = function(ms) {
                return ms / 1e3
            }, Timer.prototype.start = function() {
                this._running = !0
            }, Timer.prototype.stop = function() {
                this._running = !1
            }, Timer.prototype.reset = function() {
                this.currentCount = 0, this.timeLeft = this.delay, this.stop()
            }, Timer.prototype.update = function() {
                !this._running || this.complete || this._invalid || (this.timeLeft <= 0 ? (this.timeLeft = this.delay + this.timeLeft, ++this.currentCount, this.signals.timer.dispatch(this), this.complete && (this.timeLeft = 0, this.signals.timerComplete.dispatch(this))) : this.timeLeft -= Timestep.deltaTime)
            }, Timer.prototype.dispose = function() {
                this._invalid = !0, this.stop(), this.signals.timer.dispose(), this.signals.timerComplete.dispose()
            }, Object.defineProperty(Timer.prototype, "running", {
                get: function() {
                    return this._running && !this.complete
                }
            }), Object.defineProperty(Timer.prototype, "invalid", {
                get: function() {
                    return this._invalid
                }
            }), Object.defineProperty(Timer.prototype, "complete", {
                get: function() {
                    return this.repeatCount && this.currentCount >= this.repeatCount
                }
            })
        }, {
            "./../Timestep": 5
        }],
        48: [function(require, module, exports) {
            var Utils = function() {};
            module.exports = Utils, Utils.VERSION = "01.02.00", Utils.PI = 3.141592653589793, Utils.TO_RADIANS = .017453292519943295, Utils.TO_DEGREES = 57.29577951308232, Utils.TextFieldStripUnderScores = function(text, delim) {
                return text.replace(/[_]/g, delim)
            }, Utils.HexToRGB = function(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null
            }, Utils.randomInt = function(max, min) {
                max = parseInt(max), min = parseInt(min), min = min || 0;
                var randomRange;
                return min < max ? (randomRange = Math.round(Math.random() * (max - min)), Math.round(min + randomRange)) : min > max ? (randomRange = Math.round(Math.random() * (min - max)), Math.round(min - randomRange)) : max
            }, Utils.randomRange = function(max, min) {
                return Math.random() * (max - min) + min
            }, Utils.randomBoolean = function() {
                return Math.random() >= .5
            }, Utils.roundNumber = function(number, numDecimalPlaces) {
                numDecimalPlaces = numDecimalPlaces || 0;
                var decimals = Math.pow(10, numDecimalPlaces);
                return Math.round(Math.floor(number * decimals) / decimals)
            }, Utils.padNumber = function(number, width) {
                width = width || 0;
                var n = Math.abs(number),
                    zeros = Math.max(0, width - Math.floor(n).toString().length),
                    zeroString = Math.pow(10, zeros).toString().substr(1);
                return number < 0 && (zeroString = "-" + zeroString), zeroString + n
            }, Utils.roundToPointFive = function(number) {
                return Math.round(2 * number) / 2
            }, Utils.stringToFunction = function(str) {
                for (var arr = str.split("."), thisWindow = window = window.self, fn = thisWindow || this, i = 0, len = arr.length; i < len; i++) fn = fn[arr[i]];
                if ("function" != typeof fn) throw new Error("[Utils.stringToFunction] function not found = " + str);
                return fn
            }, Utils.distanceSqrt = function(pointB, pointA) {
                var xs = 0,
                    ys = 0;
                return xs = pointB.x - pointA.x, xs *= xs, ys = pointB.y - pointA.y, ys *= ys, Math.sqrt(xs + ys)
            }, Utils.distanceSqrtFast = function(pointB, pointA) {
                return (pointB.x - pointA.x) * (pointB.x - pointA.x) + (pointB.y - pointA.y) * (pointB.y - pointA.y)
            }, Utils.shuffleArray = function(array) {
                for (var currentIndex = array.length, temporaryValue = null, randomIndex = null; 0 !== currentIndex;) randomIndex = Math.floor(Math.random() * currentIndex), currentIndex -= 1, temporaryValue = array[currentIndex], array[currentIndex] = array[randomIndex], array[randomIndex] = temporaryValue;
                return array
            }, Utils.randomItemFromArray = function(array) {
                return array[Utils.randomInt(array.length - 1)]
            }, Utils.rectangleIntersects = function(rectA, rectB) {
                return rectA.x <= rectB.x + rectB.width && rectB.x <= rectA.x + rectA.width && rectA.y <= rectB.y + rectB.height && rectB.y <= rectA.y + rectA.height
            }, Utils.validateEmail = function(email) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email)
            }, Utils.commaFormatNumber = function(num) {
                return (num + "").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,")
            }, Utils.checkStringForMatch = function(str, matchArr) {
                var wordlist = matchArr.join("|"),
                    myRegExp = new RegExp(wordlist),
                    matchPos = str.search(myRegExp);
                return matchPos != -1
            }, Utils.getURLParameter = function(name, opt_default) {
                var value = decodeURI((RegExp(name + "=(.+?)(&|$)").exec(location.search) || [, null])[1]);
                return "null" === value && opt_default && (value = opt_default), value
            }, Utils.goBack = function(count) {
                count = count || -1;
                var thisWindow = window.top || window;
                thisWindow.history.go(count)
            }, Utils.convertStringToXML = function(str) {
                var parseXml, thisWindow = window.top || window;
                return (parseXml = thisWindow.DOMParser ? function(xmlStr) {
                    return (new thisWindow.DOMParser).parseFromString(xmlStr, "text/xml")
                } : "undefined" != typeof thisWindow.ActiveXObject && new window.ActiveXObject("Microsoft.XMLDOM") ? function(xmlStr) {
                    var xmlDoc = new thisWindow.ActiveXObject("Microsoft.XMLDOM");
                    return xmlDoc.async = "false", xmlDoc.loadXML(xmlStr), xmlDoc
                } : function() {
                    return null
                })(str)
            }, Utils.stringToBoolean = function(str) {
                switch (str.toString().toLowerCase()) {
                    case "true":
                    case "yes":
                    case "1":
                        return !0;
                    case "false":
                    case "no":
                    case "0":
                    case null:
                        return !1;
                    default:
                        return Boolean(string)
                }
            }, Utils.clampNumber = function(value, min, max) {
                return Math.min(Math.max(value, min), max)
            }, Utils.normaliseNumber = function(value, min, max) {
                return (value - min) / (max - min)
            }, Utils.lerpNumber = function(normalisedValue, min, max) {
                return (max - min) * normalisedValue + min
            }, Utils.mapNumber = function(value, sourceMin, sourceMax, destMin, destMax) {
                return Utils.lerpNumber(Utils.normaliseNumber(value, sourceMin, sourceMax), destMin, destMax)
            }, Utils.scaleValue = function(currentValue, desiredWidth) {
                return desiredWidth / currentValue
            }, Utils.pointInRect = function(point, rect) {
                return Utils.inRange(point.x, rect.x, rect.x + rect.width) && Utils.inRange(point.y, rect.y, rect.y + rect.height)
            }, Utils.inRange = function(value, min, max) {
                return value >= Math.min(min, max) && value <= Math.max(min, max)
            }, Utils.generateGUID = function() {
                var d = (new Date).getTime(),
                    uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
                return uuid.replace(/[xy]/g, function(c) {
                    var r = (d + 16 * Math.random()) % 16 | 0;
                    return d = Math.floor(d / 16), ("x" == c ? r : 7 & r | 8).toString(16)
                })
            }, Utils.createHitAreaSprite = function(opt_debug) {
                var hit = new PIXI.DisplayObjectContainer;
                if (hit.interactive = !0, hit.hitArea = new PIXI.Rectangle(0, 0, Canvas.width, Canvas.height), opt_debug) {
                    var g = new PIXI.Graphics;
                    g.beginFill("0x00ccff", .7), g.drawRect(0, 0, Canvas.width, Canvas.height), hit.addChild(g)
                }
                return hit
            }, Utils.createModalBlock = function(color, alpha, opt_width, opt_height, resolution) {
                color = color || "0x000000", alpha = "undefined" == typeof alpha ? .7 : alpha;
                var width = opt_width || Canvas.width,
                    height = opt_height || Canvas.height;
                resolution = resolution || 1;
                var graphic = new PIXI.Graphics;
                graphic.beginFill(color, alpha), graphic.drawRect(0, 0, width, height);
                var modalBlock = new PIXI.Sprite(graphic.generateTexture(resolution));
                return modalBlock.interactive = !0, modalBlock.buttonMode = !1, modalBlock.mousedown = modalBlock.mouseup = modalBlock.click = modalBlock.tap = function() {}, modalBlock
            }, Utils.cloneObject = function(obj) {
                if (null == obj || "object" != typeof obj) return obj;
                var temp = obj.constructor();
                for (var key in obj) obj.hasOwnProperty(key) && (temp[key] = Utils.cloneObject(obj[key]));
                return temp
            }, Utils.calculateParabola = function(sx, sy, tx, ty, no_frames, overshoot) {
                tx -= sx, ty = -(ty - sy);
                var py;
                py = ty > 0 ? ty + overshoot : overshoot;
                var px, a = ty,
                    b = -2 * tx * py,
                    c = py * tx * tx,
                    px1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a),
                    px2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                px = ty > 0 && tx > 0 || ty < 0 && tx < 0 ? Math.min(px1, px2) : Math.max(px1, px2);
                for (var x, y, k = -py / (px * px), ret_y = [], ret_x = [], i = 0; i < no_frames + 1; i++) x = i * tx / no_frames, y = k * (x * x - 2 * x * px), ret_x.push(x + sx), ret_y.push(sy - y);
                return {
                    x: ret_x,
                    y: ret_y
                }
            }, Utils.logNestedArray = function(array) {
                var str = JSON.stringify(array);
                str = str.replace(/(?:],)/g, "],\n"), console.log(str)
            }
        }, {}]
    }, {}, [22])(22)
});