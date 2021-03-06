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
            function AI(sequence, defaultAnimation) {
                Actor.call(this, sequence, defaultAnimation), this.signals.path = {}, this.signals.path.next = new signals.Signal, this.signals.path.repeat = new signals.Signal, this.signals.path.complete = new signals.Signal, this.group = null, this.velocity = new p3.Vector2, this.baseSpeed = 400, this.maxSpeed = 0, this.damping = .99, this.nodeDelay = 0, this.repeatCount = 0, this.faceDir = !1, this.value = 0, this._path = null, this._pathIndex = -1, this._pathOrigin = null, this._debugPathNodes = [], this._lastDistance = Number.MAX_VALUE
            }
            var Actor = require("./Actor"),
                Common = (require("./AIPath"), require("./Common"));
            module.exports = AI, AI.prototype = Object.create(Actor.prototype), AI.prototype.constructor = AI, AI.seek = function(character, target, speed) {
                speed = speed || 100;
                var force = new p3.Vector2;
                return force.x = target.x - character.x, force.y = target.y - character.y, force.normalize(1), force.scaleBy(speed), force
            }, AI.seek2 = function(character, target, characterVelocity, speed) {
                speed = speed || 100;
                var force = new p3.Vector2;
                return force.x = target.x - character.x, force.y = target.y - character.y, force.normalize(1), force.scaleBy(speed), new p3.Vector2(force.x - characterVelocity.x, force.y - characterVelocity.y)
            }, AI.pursue = function(character, target, characterVelocity, targetVelocity, maxSpeed, maxPrediction) {
                maxSpeed = maxSpeed || 100, maxPrediction = maxPrediction || 1;
                var to = new p3.Vector2;
                to.x = target.x - character.x, to.y = target.y - character.y;
                var prediction, distance = to.length,
                    speed = characterVelocity.length;
                return prediction = speed <= distance / maxPrediction ? maxPrediction : distance / speed, AI.seek2(character, new PIXI.Point(target.x + targetVelocity.x * prediction, target.y + targetVelocity.y * prediction), characterVelocity, maxSpeed)
            }, AI.arrive = function(character, target, speed, radius) {
                speed = speed || 100, radius = radius || 40;
                var force = new p3.Vector2;
                if (force.x = target.x - character.x, force.y = target.y - character.y, force.length < radius) return new p3.Vector2;
                var time = .05;
                return force.x /= time, force.y /= time, force.length > speed && force.truncate(speed), force
            }, AI.prototype.reset = function() {}, AI.prototype.destroy = function() {
                this.signals.path.next.dispose(), this.signals.path.repeat.dispose(), this.signals.path.complete.dispose(), this.clearPath(), Actor.prototype.destroy.call(this)
            }, AI.prototype.update = function() {
                if (this._path && this.nodeDelay <= 0) {
                    this.nodeDelay = 0;
                    var target = this.targetNodeWorldPosition,
                        force = AI.seek(this.position, target, this.maxSpeed);
                    this._path.smooth ? (this.x += this.velocity.x * p3.Timestep.deltaTime, this.y += this.velocity.y * p3.Timestep.deltaTime, this.velocity.x += force.x * p3.Timestep.deltaTime, this.velocity.y += force.y * p3.Timestep.deltaTime, this.velocity.x *= this.damping, this.velocity.y *= this.damping) : (this.x += force.x * p3.Timestep.deltaTime, this.y += force.y * p3.Timestep.deltaTime);
                    var speed = this._path.smooth ? Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) : Math.sqrt(force.x * force.x + force.y * force.y),
                        to = new p3.Vector2(target.x - this.x, target.y - this.y),
                        d = to.length,
                        delta = d - this._lastDistance,
                        overshootRadius = .1 * speed;
                    this._lastDistance = d, (d < speed * p3.Timestep.deltaTime || d < overshootRadius && delta > 0) && this.nextNode(), this.faceDir && (this.velocity.x < 0 ? this.scale.x = 1 : this.velocity.x > 0 && (this.scale.x = -1))
                }
                this.nodeDelay > 0 && (this.nodeDelay -= p3.Timestep.deltaTime)
            }, AI.prototype.setPath = function(path, debug) {
                if (path && path.length && (this._path = path, this._pathIndex = 0, this.x = this.x + this._path.head.position.x, this.y = this.y + this._path.head.position.y, this._pathOrigin = new PIXI.Point(this.x, this.y), console.log("start path"), this.nextNode(), debug))
                    for (var node, sprite, i = 0; i < path.length; ++i) node = path.nodeAtIndex(i), sprite = new PIXI.Sprite(Common.assets.getTexture("enemy_bomb_000")), sprite.x = this._pathOrigin.x + node.position.x, sprite.y = this._pathOrigin.y + node.position.y, sprite.scale = new PIXI.Point(.25, .25), sprite.anchor = new PIXI.Point(.5, .5), sprite.tint = 16711680, this.parent.addChild(sprite), this._debugPathNodes.push(sprite)
            }, AI.prototype.clearPath = function() {
                this._path = null, this._pathIndex = -1, this._pathOrigin = null, this.repeatCount = 0, this.clearDebugPath()
            }, AI.prototype.clearDebugPath = function() {
                var i, sprite;
                for (i = 0; i < this._debugPathNodes.length; ++i) sprite = this._debugPathNodes[i], sprite.parent.removeChild(sprite);
                this._debugPathNodes.length = 0
            }, AI.prototype.nextNode = function() {
                if (this.maxSpeed = this.baseSpeed * this.targetNode.speed, this.damping = this.targetNode.damping, this.nodeDelay = this._path.delay + this.targetNode.delay, !this._path.smooth) {
                    var target = this.targetNodeWorldPosition;
                    this.x = target.x, this.y = target.y
                }
                if (++this._pathIndex, this._lastDistance = Number.MAX_VALUE, console.log("node " + this._pathIndex), this.signals.path.next.dispatch(this), this._pathIndex >= this._path.length)
                    if (this._path.repeat > 0 && this.repeatCount < this._path.repeat || this._path.repeat == -1) {
                        this._path.repeat != -1 && ++this.repeatCount, console.log("repeat path");
                        var debug = this._debugPathNodes.length > 0;
                        this.clearDebugPath(), this.setPath(this._path, debug), this.signals.path.repeat.dispatch(this)
                    } else this._path.remove ? this.takeDamage(Number.MAX_VALUE, !1) : this.clearPath(), console.log("end path"), this.signals.path.complete.dispatch(this)
            }, Object.defineProperty(AI.prototype, "path", {
                get: function() {
                    return this._path
                }
            }), Object.defineProperty(AI.prototype, "targetNode", {
                get: function() {
                    return this._path.nodeAtIndex(this._pathIndex)
                }
            }), Object.defineProperty(AI.prototype, "targetNodeWorldPosition", {
                get: function() {
                    var node = this.targetNode;
                    return new PIXI.Point(this._pathOrigin.x + node.position.x, this._pathOrigin.y + node.position.y)
                }
            })
        }, {
            "./AIPath": 2,
            "./Actor": 5,
            "./Common": 25
        }],
        2: [function(require, module, exports) {
            function AIPath(path) {
                this.delay = 0, this.smooth = !1, this.repeat = 0, this.remove = !1, this._path = path || []
            }
            var AIPathNode = require("./AIPathNode");
            require("./Common");
            module.exports = AIPath, AIPath.prototype.addNode = function(node) {
                this._path.push(node)
            }, AIPath.prototype.clear = function() {
                this._path.length = 0
            }, AIPath.prototype.nodeAtIndex = function(index) {
                return this._path[index]
            }, AIPath.prototype.parsePath = function(data) {
                this.clear(), this.delay = Math.max(0, data.delay), this.smooth = data.smooth, this.repeat = Math.max(-1, data.repeat), this.remove = data.remove;
                for (var n, node, i = 0; i < data.path.length; ++i) n = data.path[i], node = new AIPathNode(new PIXI.Point(n.x, n.y)), node.speed = n.speed, node.damping = n.damping, node.delay = n.delay, this.addNode(node)
            }, Object.defineProperty(AIPath.prototype, "path", {
                get: function() {
                    return this._path.slice()
                }
            }), Object.defineProperty(AIPath.prototype, "head", {
                get: function() {
                    return this._path[0]
                }
            }), Object.defineProperty(AIPath.prototype, "length", {
                get: function() {
                    return this._path.length
                }
            })
        }, {
            "./AIPathNode": 3,
            "./Common": 25
        }],
        3: [function(require, module, exports) {
            function AIPathNode(position) {
                this.position = position, this.speed = 1, this.damping = .999, this.delay = 0
            }
            require("./Common");
            module.exports = AIPathNode
        }, {
            "./Common": 25
        }],
        4: [function(require, module, exports) {
            function AITypes() {}
            module.exports = AITypes, AITypes.DRONE_SMALL_FLY = 0, AITypes.DRONE_SMALL_FLY_SHOOT = 1, AITypes.DRONE_SMALL = 2, AITypes.DRONE_SMALL_SHOOT = 3, AITypes.DRONE_SMALL_SPINNER = 4, AITypes.DRONE_LARGE_FLY = 5, AITypes.DRONE_LARGE_FLY_SHOOT = 6, AITypes.DRONE_LARGE = 7, AITypes.DRONE_LARGE_SHOOT = 8, AITypes.DRONE_LARGE_SPINNER = 9
        }, {}],
        5: [function(require, module, exports) {
            "use strict";

            function Actor() {
                this.view = null, this.velocity = new p3.Vector2, this.collisionRadius = 40, this.aabb = new PIXI.Rectangle, this.signals = {}, this.signals.dead = new signals.Signal, this._health = 80, this._currentHealth = this._health, PIXI.Container.call(this), this.on("added", this.init, this)
            }
            require("./Common");
            module.exports = Actor, Actor.prototype = Object.create(PIXI.Container.prototype), Actor.prototype.constructor = Actor, Actor.DEBUG_AABB = !1, Actor.prototype.init = function() {}, Actor.prototype.reset = function() {
                this.visible = !0, this.velocity = new p3.Vector2, this._currentHealth = this._health
            }, Actor.prototype.destroy = function() {
                this.off("added", this.init, this), PIXI.Sprite.prototype.destroy.call(this)
            }, Actor.prototype.update = function() {}, Actor.prototype.takeDamage = function(damage) {
                damage = Math.max(0, damage), this._currentHealth -= damage, this.dead && this.signals.dead.dispatch(this)
            }, Object.defineProperty(Actor.prototype, "spine", {
                get: function() {
                    return this.view
                },
                set: function(value) {
                    this.view = value
                }
            }), Object.defineProperty(Actor.prototype, "health", {
                get: function() {
                    return this._health
                },
                set: function(value) {
                    this._health = value, this._currentHealth = this._health
                }
            }), Object.defineProperty(Actor.prototype, "currentHealth", {
                get: function() {
                    return this._currentHealth
                }
            }), Object.defineProperty(Actor.prototype, "dead", {
                get: function() {
                    return this._currentHealth <= 0
                }
            })
        }, {
            "./Common": 25
        }],
        6: [function(require, module, exports) {
            "use strict";

            function AlienBar() {
                PIXI.Container.call(this), this._level = 0, this._step = 0, this._barSmooth = 0, this._bar = new PIXI.Sprite(Common.assets.getTexture("game_ui_powerbar_back")), this._bar.x = .5 * -this._bar.width, this._bar.y = 0, this.addChild(this._bar), this._bar.fill = new PIXI.Sprite(Common.assets.getTexture("game_ui_powerbar_fill")), this._bar.fill.y = .5 * (this._bar.height - this._bar.fill.height), this._bar.addChild(this._bar.fill), this._bar.fill.mask = new PIXI.Graphics, this._bar.fill.mask.x = 0, this._bar.fill.mask.y = 0, this._bar.fill.mask.scale.x = 0, this._bar.fill.mask.beginFill(16711680), this._bar.fill.mask.drawRect(0, 0, this._bar.fill.width, this._bar.fill.height), this._bar.fill.mask.endFill(), this._bar.fill.addChild(this._bar.fill.mask), this._portraits = [], this._steps = [];
                var i, j, portrait, morphs = Common.playerMorphs;
                for (i = 0; i < morphs.length; ++i) portrait = new PIXI.Sprite(Common.assets.getTexture("game_ui_powerbar_icon_back")), portrait.x = morphs[i].spacing * this._bar.width - .5 * this._bar.width, portrait.y = 6, portrait.anchor = new PIXI.Point(.5, .5), this.addChild(portrait), portrait.icon = new p3.AdditiveSprite(Common.assets.getTexture(morphs[i].icon)), portrait.icon.anchor = new PIXI.Point(.5, .5), portrait.icon.filters = [new p3.DesaturationFilter(.92)], portrait.addChild(portrait.icon), this._portraits.push(portrait);
                var step, spacing, next;
                for (i = 0; i < this._portraits.length - 1; ++i)
                    for (portrait = this._portraits[i], next = this._portraits[i + 1], spacing = morphs[i].steps > 0 ? .66 * (next.x - portrait.x) / (morphs[i].steps + 1) : 0, this._steps.push([]), j = 0; j < morphs[i].steps; ++j) step = new PIXI.Sprite(Common.assets.getTexture("game_ui_powerbar_charge_off")), step.x = portrait.x + .5 * (next.x - portrait.x) + j * spacing - spacing * (morphs[i].steps - 1) * .5, step.y = .5 * this._bar.height + 12, step.anchor = new PIXI.Point(.5, .5), this.addChild(step), this._steps[i].push(step);
                for (i = 0; i < this._portraits.length; ++i) portrait = this._portraits[i], portrait.parent.addChild(portrait)
            }
            var Common = require("./Common");
            module.exports = AlienBar, AlienBar.prototype = Object.create(PIXI.Container.prototype), AlienBar.prototype.constructor = AlienBar, AlienBar.prototype.destroy = function() {
                this.off("added", this.init), PIXI.Container.prototype.destroy.call(this)
            }, AlienBar.prototype.update = function() {
                this._bar.fill.mask.scale.x += .06 * (this._barSmooth - this._bar.fill.mask.scale.x)
            }, AlienBar.prototype.upgrade = function(animate) {
                var morphs = Common.playerMorphs;
                this._step < morphs[this._level].steps ? this.nextStep(animate) : this.nextAlien(animate)
            }, AlienBar.prototype.downgrade = function(animate) {
                this.previousAlien(animate)
            }, AlienBar.prototype.nextStep = function(animate) {
                var steps = this._steps[this._level],
                    step = steps[this._step++];
                step.texture = Common.assets.getTexture("game_ui_powerbar_charge_on"), animate && (step.tl = new TimelineMax, step.tl.append(TweenMax.to(step.scale, .2, {
                    delay: .4,
                    x: 1.4,
                    y: 1.4,
                    ease: Power0.easeNone
                })), step.tl.append(TweenMax.to(step.scale, .16, {
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [1]
                }))), this._barSmooth = (step.x + .5 * this._bar.width) / this._bar.width, animate || (this._bar.fill.mask.scale.x = this._barSmooth)
            }, AlienBar.prototype.nextAlien = function(animate) {
                if (!(this._level >= this._portraits.length)) {
                    this._step = 0;
                    var portrait, last = this._portraits[this._level++];
                    if (last.tl && (last.tl.kill(), last.tl = null), TweenMax.killTweensOf(last), TweenMax.to(last.scale, .4, {
                            x: 1,
                            y: 1,
                            ease: Power1.easeOut
                        }), animate) {
                        portrait = this._portraits[this._level], TweenMax.killTweensOf(portrait), this._barSmooth = (portrait.x + .5 * this._bar.width) / this._bar.width, portrait.tl = new TimelineMax({
                            onComplete: function() {
                                this.animatePulse(portrait)
                            },
                            onCompleteScope: this
                        }), portrait.tl.append(TweenMax.to(portrait.scale, .2, {
                            delay: .32,
                            x: 1.4,
                            y: 1.4,
                            ease: Power0.easeNone
                        })), portrait.tl.append(TweenMax.to(portrait.scale, .16, {
                            x: 1,
                            y: 1,
                            ease: Back.easeOut,
                            easeParams: [1]
                        })), TweenMax.to(portrait.icon, .54, {
                            delay: .32,
                            blendStrength: .4,
                            easeParams: Power1.easeInOut,
                            yoyo: !0,
                            repeat: 1
                        });
                        var filter = portrait.icon.filters[0];
                        TweenMax.to(filter, .4, {
                            strength: 0,
                            ease: Power1.easeInOut
                        })
                    } else {
                        portrait = this._portraits[this._level], this._barSmooth = (portrait.x + .5 * this._bar.width) / this._bar.width, this._bar.fill.mask.scale.x = this._barSmooth;
                        for (var i = 0; i <= this._level; ++i) portrait = this._portraits[i], portrait.icon.filters[0].strength = 0;
                        portrait = this._portraits[this._level], this.animatePulse(portrait)
                    }
                }
            }, AlienBar.prototype.previousAlien = function(animate) {
                if (!(this._level <= 0)) {
                    this._step = 0;
                    var last = this._portraits[this._level];
                    if (TweenMax.killTweensOf(last), TweenMax.to(last.scale, .4, {
                            x: 1,
                            y: 1,
                            ease: Power1.easeOut
                        }), --this._level, animate) {
                        var filter = last.icon.filters[0];
                        TweenMax.to(filter, .4, {
                            strength: .92,
                            ease: Power1.easeInOut
                        })
                    } else last.icon.filters[0].strength = .92;
                    var portrait = this._portraits[this._level];
                    this._barSmooth = (portrait.x + .5 * this._bar.width) / this._bar.width, animate || (this._bar.mask.fill.scale.x = this._barSmooth);
                    var step, i, steps = this._steps[this._level + 1] || [];
                    for (i = 0; i < steps.length; ++i) step = steps[i], step.texture = Common.assets.getTexture("game_ui_powerbar_charge_off");
                    for (steps = this._steps[this._level], i = 0; i < steps.length; ++i) step = steps[i], step.texture = Common.assets.getTexture("game_ui_powerbar_charge_off");
                    this.animatePulse(portrait)
                }
            }, AlienBar.prototype.animatePulse = function(target) {
                TweenMax.killTweensOf(target), TweenMax.to(target.scale, .8, {
                    x: 1.2,
                    y: 1.2,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                })
            }
        }, {
            "./Common": 25
        }],
        7: [function(require, module, exports) {
            "use strict";

            function Application() {}
            var Common = (require("./AudioParams"), require("./Common")),
                ConfirmScene = require("./ConfirmScene"),
                GameScene = require("./GameScene"),
                HelpScene = require("./HelpScene"),
                IntroScene = require("./IntroScene"),
                ResultScene = require("./ResultScene"),
                SplashScene = require("./SplashScene");
            module.exports = Application, Application.prototype.init = function() {
                this.showSplashScene()
            }, Application.prototype.showSplashScene = function() {
                Common.currentLevel = 0, Common.currentScore = 0;
                var scene = new SplashScene;
                scene.signals.next.add(function() {
                    this.showIntroScene()
                }, this);
                var transition = new p3.FadeTransition(0, 1);
                return Common.scene.add(scene, transition), scene
            }, Application.prototype.showIntroScene = function() {
                var scene = new IntroScene;
                scene.signals.next.add(function() {
                    this.showGameScene()
                }, this), scene.signals.home.add(function() {
                    this.showSplashScene()
                }, this);
                var transition = new p3.FadeTransition(0, 1);
                return Common.scene.add(scene, transition), scene
            }, Application.prototype.showGameScene = function() {
                Common.animator.paused = !1;
                var scene = new GameScene;
                scene.signals.next.add(function(scene, score, victory) {
                    victory ? (++Common.currentLevel, this.showGameScene()) : (Common.currentScore = 0, Common.saveHighscore(score), this.showResultScene(score, victory))
                }, this), scene.signals.pause.add(function(scene, paused) {
                    Common.animator.paused = !0;
                    var help = this.showHelpScene(paused);
                    help.signals.next.add(function() {
                        Common.animator.paused = !1
                    }, this, 1)
                }, this);
                var transition = new p3.FadeTransition(0, 1);
                return Common.scene.add(scene, transition), scene
            }, Application.prototype.showHelpScene = function(paused) {
                var scene = new HelpScene(paused);
                scene.signals.home.add(function() {
                    var confirm = this.showConfirmScene();
                    confirm.signals.next.add(function() {
                        this.showSplashScene()
                    }, this, 1), confirm.signals.previous.add(function() {
                        scene.signals.next.dispatch(this)
                    }, this, 1)
                }, this), scene.signals.next.add(function() {
                    Common.scene.remove()
                }, this);
                var transition = new p3.Transition;
                return transition.push = !0, Common.scene.add(scene, transition), scene
            }, Application.prototype.showResultScene = function(score, victory) {
                var scene = new ResultScene(score, victory);
                scene.signals.next.add(function() {
                    ++Common.currentLevel % Common.config.levels.length == 0 && ++Common.difficultyModifier, this.showGameScene()
                }, this), scene.signals.previous.add(function() {
                    this.showGameScene()
                }, this), scene.signals.home.add(function() {
                    this.showSplashScene()
                }, this);
                var transition = new p3.FadeTransition(0, 1);
                return Common.scene.add(scene, transition), scene
            }, Application.prototype.showConfirmScene = function() {
                var scene = new ConfirmScene;
                scene.signals.previous.add(function() {
                    Common.scene.remove()
                }, this);
                var transition = new p3.Transition;
                return transition.push = !0, transition.replace = !1, Common.scene.add(scene, transition), scene
            }
        }, {
            "./AudioParams": 9,
            "./Common": 25,
            "./ConfirmScene": 26,
            "./GameScene": 38,
            "./HelpScene": 45,
            "./IntroScene": 48,
            "./ResultScene": 58,
            "./SplashScene": 64
        }],
        8: [function(require, module, exports) {
            function AudioManager() {
                this._cache = {}, this._music = null, this._isMuted = !1;
                var hidden;
                "undefined" != typeof document.hidden ? (hidden = "hidden", this.visibilityChange = "visibilitychange") : "undefined" != typeof document.mozHidden ? (hidden = "mozHidden", this.visibilityChange = "mozvisibilitychange") : "undefined" != typeof document.msHidden ? (hidden = "msHidden", this.visibilityChange = "msvisibilitychange") : "undefined" != typeof document.webkitHidden && (hidden = "webkitHidden", this.visibilityChange = "webkitvisibilitychange"), document.addEventListener(this.visibilityChange, function() {
                    document[hidden] ? Howler.volume(0) : Howler.volume(1)
                }, !1)
            }
            var AudioParams = require("./AudioParams");
            module.exports = AudioManager, AudioManager.prototype.addSounds = function(sounds, extensions, basePath) {
                basePath = basePath || "";
                var howl, name, url, urls, extension, i, j;
                for (i = 0; i < sounds.length; ++i) {
                    for (url = basePath + sounds[i], url = url.split("/"), name = url[url.length - 1], urls = [], j = 0; j < extensions.length; ++j) extension = extensions[j], urls.push(url.join("/") + extension);
                    howl = new Howl({
                        src: urls,
                        volume: 1,
                        loop: !1,
                        autoplay: !1,
                        onloaderror: function() {
                            console.warn("Error loading sound - " + name)
                        }
                    }), howl.name = name, this._cache[name] = howl
                }
            }, AudioManager.prototype.removeSounds = function(sounds) {
                for (var name, n, howl, i = 0; i < sounds.length; ++i) {
                    name = sounds[i];
                    for (n in this._cache)
                        if (this._cache.hasOwnProperty(key) && (howl = this._cache[key], howl.name == n)) {
                            howl.unload(), delete this._cache[name];
                            break
                        }
                }
            }, AudioManager.prototype.playSound = function(name, params) {
                params = params || new AudioParams, "string" != typeof name && (name = name[Math.floor(Math.random() * name.length)]);
                var howl = this._cache[name];
                return howl ? (howl.volume(params.volume), howl.loop(params.loop), p3.Device && p3.Device.isAndroidStockBrowser && (howl.buffer = !0), params.fadeIn > 0 ? this.fadeIn(howl, params.fadeIn) : howl.play(), howl) : (console.warn("Could not find sound - " + name), null)
            }, AudioManager.prototype.playMusic = function(name, params) {
                if (params = params || new AudioParams, "string" != typeof name && (name = name[Math.floor(Math.random() * name.length)]), this._music && this._music.name == name) return this._music;
                var howl = this._cache[name];
                return howl ? (howl.volume(params.volume), howl.loop(!0), howl.__onend = function() {
                    params.callback && params.callback.call(params.scope)
                }, howl.on("end", howl.__onend), p3.Device && p3.Device.isAndroidStockBrowser && (howl.buffer = !0), params.fadeIn > 0 ? (this._music && this._music.name != name && this.fadeOut(this._music, params.fadeIn, function(howl) {
                    howl.stop()
                }, this), this.fadeIn(howl, params.fadeIn)) : (this._music && this.stopMusic(), howl.play()), this._music = howl, howl) : (console.warn("Could not find music - " + name), null)
            }, AudioManager.prototype.stopSound = function(name) {
                var howl;
                for (var n in this._cache)
                    if (this._cache.hasOwnProperty(n) && (howl = this._cache[n], howl.name == name)) {
                        howl.stop();
                        break
                    }
            }, AudioManager.prototype.stopMusic = function(name) {
                name = name || this._music.name, this._music && this._music.name == name && (this._music.__onend && this._music.off("end", this._music.__onend), this._music.stop(), this._music = null)
            }, AudioManager.prototype.mute = function(value) {
                this._isMuted = value, this._isMuted ? Howler.mute(!0) : Howler.mute(!1)
            }, AudioManager.prototype.fadeIn = function(howl, duration, callback, scope) {
                duration = duration || 1, howl.volume(0), howl.play(), howl.__volume = howl._volume, TweenMax.killTweensOf(howl), TweenMax.to(howl, duration, {
                    __volume: 1,
                    ease: Power1.easeInOut,
                    onUpdate: function() {
                        howl.volume(howl.__volume)
                    },
                    onUpdateScope: this,
                    onComplete: callback,
                    onCompleteParams: [howl],
                    onCompleteScope: scope
                })
            }, AudioManager.prototype.fadeOut = function(howl, duration, callback, scope) {
                duration = duration || 1, howl.__volume = howl._volume, TweenMax.killTweensOf(howl), TweenMax.to(howl, duration, {
                    __volume: 0,
                    ease: Power1.easeInOut,
                    onUpdate: function() {
                        howl.volume(howl.__volume)
                    },
                    onUpdateScope: this,
                    onComplete: callback,
                    onCompleteParams: [howl],
                    onCompleteScope: scope
                })
            }, Object.defineProperty(AudioManager.prototype, "isMute", {
                get: function() {
                    return this._isMuted
                }
            })
        }, {
            "./AudioParams": 9
        }],
        9: [function(require, module, exports) {
            "use strict";

            function AudioParams() {
                this.volume = 1, this.loop = !1, this.delay = 0, this.fadeIn = 0, this.priority = 0, this.callback = null, this.scope = window
            }
            module.exports = AudioParams
        }, {}],
        10: [function(require, module, exports) {
            "use strict";

            function Ben1() {
                Player.call(this), this.speed = 2620, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("ben")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine), this.spine.stateData.setMixByName("idle_001", "crash_001", .06), this.fireRate = .42, this.fireOffset = new PIXI.Point(44, 0), this.aabb = new PIXI.Rectangle((-72), (-72), 144, 90)
            }
            var BulletTypes = (require("./Actor"), require("./BulletTypes")),
                Common = require("./Common"),
                Player = require("./Player");
            module.exports = Ben1, Ben1.prototype = Object.create(Player.prototype), Ben1.prototype.constructor = Ben1, Ben1.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_001", !0)
            }, Ben1.prototype.update = function() {
                Player.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, Ben1.prototype.fire = function() {
                this._fireTime = this.fireRate;
                var type = BulletTypes.SPINNING_DISK,
                    position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y),
                    rotation = 0,
                    direction = new p3.Vector2(1, 0);
                this.signals.fire.dispatch(type, this, position, rotation, direction, !1), Common.audio.playSound(["sfx_ben_shoot_4_00", "sfx_ben_shoot_4_01", "sfx_ben_shoot_4_02", "sfx_ben_shoot_4_03"])
            }, Ben1.prototype.deathAnimation = function() {
                Player.prototype.deathAnimation.call(this), this.spine.state.setAnimationByName(0, "crash_001", !0)
            }
        }, {
            "./Actor": 5,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54
        }],
        11: [function(require, module, exports) {
            "use strict";

            function Ben2() {
                Player.call(this), this.speed = 2680, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("ben")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine), this.fireRate = .38, this.fireOffset = new PIXI.Point(40, 0), this.aabb = new PIXI.Rectangle((-72), (-96), 144, 114)
            }
            var BulletTypes = (require("./Actor"), require("./BulletTypes")),
                Common = require("./Common"),
                Player = require("./Player");
            module.exports = Ben2, Ben2.prototype = Object.create(Player.prototype), Ben2.prototype.constructor = Ben2, Ben2.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_002", !0)
            }, Ben2.prototype.update = function() {
                Player.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, Ben2.prototype.fire = function() {
                this._fireTime = this.fireRate;
                var type = BulletTypes.SPINNING_DISK,
                    position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y),
                    rotation = 0,
                    direction = new p3.Vector2(1, 0);
                this.signals.fire.dispatch(type, this, position, rotation, direction, !1), Common.audio.playSound(["sfx_ben_shoot_4_00", "sfx_ben_shoot_4_01", "sfx_ben_shoot_4_02", "sfx_ben_shoot_4_03"])
            }
        }, {
            "./Actor": 5,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54
        }],
        12: [function(require, module, exports) {
            "use strict";

            function BenButton(states) {
                p3.Button.call(this, states), this._outerRing = new PIXI.Sprite(states.outerRing || PIXI.Texture.EMPTY), this._outerRing.anchor = new PIXI.Point(.5, .5), this.addChild(this._outerRing), this._innerRing = new PIXI.Sprite(states.innerRing || PIXI.Texture.EMPTY), this._innerRing.anchor = new PIXI.Point(.5, .5), this.addChild(this._innerRing)
            }
            module.exports = BenButton, BenButton.prototype = Object.create(p3.Button.prototype), BenButton.prototype.constructor = BenButton, BenButton.prototype.onMouseOver = function() {
                p3.Button.prototype.onMouseOver.call(this), TweenMax.killTweensOf(this._innerRing);
                var speed = 4;
                TweenMax.to(this._innerRing, (Math.PI - this._innerRing.rotation) / speed, {
                    rotation: Math.PI,
                    ease: Power1.easeInOut
                }), TweenMax.killTweensOf(this._outerRing), speed = 2, TweenMax.to(this._outerRing, Math.abs((-(.5 * Math.PI) - this._outerRing.rotation) / speed), {
                    rotation: .5 * -Math.PI,
                    ease: Power1.easeInOut
                })
            }, BenButton.prototype.onMouseOut = function() {
                p3.Button.prototype.onMouseOut.call(this), TweenMax.killTweensOf(this._innerRing);
                var speed = 4;
                TweenMax.to(this._innerRing, this._innerRing.rotation / speed, {
                    rotation: 0,
                    ease: Power1.easeInOut
                }), TweenMax.killTweensOf(this._outerRing), speed = 2, TweenMax.to(this._outerRing, Math.abs(this._outerRing.rotation / speed), {
                    rotation: 0,
                    ease: Power1.easeInOut
                })
            }
        }, {}],
        13: [function(require, module, exports) {
            "use strict";

            function BenMuteButton(states) {
                p3.MuteButton.call(this, states), this._outerRing = new PIXI.Sprite(states.outerRing || PIXI.Texture.EMPTY), this._outerRing.anchor = new PIXI.Point(.5, .5), this.addChild(this._outerRing), this._innerRing = new PIXI.Sprite(states.innerRing || PIXI.Texture.EMPTY), this._innerRing.anchor = new PIXI.Point(.5, .5), this.addChild(this._innerRing)
            }
            module.exports = BenMuteButton, BenMuteButton.prototype = Object.create(p3.MuteButton.prototype), BenMuteButton.prototype.constructor = BenMuteButton, BenMuteButton.prototype.onMouseOver = function() {
                p3.Button.prototype.onMouseOver.call(this), TweenMax.killTweensOf(this._innerRing);
                var speed = 4;
                TweenMax.to(this._innerRing, (Math.PI - this._innerRing.rotation) / speed, {
                    rotation: Math.PI,
                    ease: Power1.easeInOut
                }), TweenMax.killTweensOf(this._outerRing), speed = 2, TweenMax.to(this._outerRing, Math.abs((-(.5 * Math.PI) - this._outerRing.rotation) / speed), {
                    rotation: .5 * -Math.PI,
                    ease: Power1.easeInOut
                })
            }, BenMuteButton.prototype.onMouseOut = function() {
                p3.Button.prototype.onMouseOut.call(this), TweenMax.killTweensOf(this._innerRing);
                var speed = 4;
                TweenMax.to(this._innerRing, this._innerRing.rotation / speed, {
                    rotation: 0,
                    ease: Power1.easeInOut
                }), TweenMax.killTweensOf(this._outerRing), speed = 2, TweenMax.to(this._outerRing, Math.abs(this._outerRing.rotation / speed), {
                    rotation: 0,
                    ease: Power1.easeInOut
                })
            }
        }, {}],
        14: [function(require, module, exports) {
            "use strict";

            function Bomb(owner) {
                this.owner = owner, this.signals = {}, this.signals.fire = new signals.Signal
            }
            module.exports = Bomb, Bomb.prototype.destroy = function() {
                this.signals.fire.dispose()
            }, Bomb.prototype.activate = function(position) {
                Bomb.prototype.destroy.call(this)
            }
        }, {}],
        15: [function(require, module, exports) {
            "use strict";

            function BombTypes() {}
            module.exports = BombTypes, BombTypes.SHOCKWAVE = "shockwave", BombTypes.MISSILE = "missile", BombTypes.HEATBLAST_WAVE1 = "heatblast_wave1", BombTypes.HEATBLAST_WAVE2 = "heatblast_wave2", BombTypes.GOO_RADIAL = "goo_radial", BombTypes.GOO_SPLAT = "goo_splat"
        }, {}],
        16: [function(require, module, exports) {
            "use strict";

            function Boss() {
                Actor.call(this), this.health = 200, this.acceleration = 120, this.slowSpeed = 80, this.fastSpeed = 280, this.fleeSpeed = 540, this.laserOffset = new PIXI.Point((-138), (-216)), this.missileOffset = new PIXI.Point(20, (-252)), this.diskOffset = new PIXI.Point(74, (-338)), this._active = !1, this._fleeing = !1;
                var holder = new PIXI.Container;
                holder.x = 80, holder.y = -40, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("boss")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine), this.spine.stateData.setMixByName("laser_fire_top", "laser_lower", .2), this.spine.stateData.setMixByName("laser_fire_mid", "laser_lower", .2), this.spine.stateData.setMixByName("laser_fire_btm", "laser_lower", .2), this.spine.stateData.setMixByName("laser_fire_top", "laser_fire_mid", .2), this.spine.stateData.setMixByName("laser_fire_top", "laser_fire_btm", .2), this.spine.stateData.setMixByName("laser_fire_mid", "laser_fire_btm", .2), this.spine.stateData.setMixByName("laser_fire_mid", "laser_fire_top", .2), this.spine.stateData.setMixByName("laser_fire_btm", "laser_fire_top", .2), this.spine.stateData.setMixByName("laser_fire_btm", "laser_fire_mid", .2);
                var width = 584,
                    height = 142;
                this.aabb = new PIXI.Rectangle(.5 * -width + 30, .5 * -height - 108, width, height), this.signals.fireLaser = new signals.Signal, this.signals.fireDisk = new signals.Signal, this.signals.fireMissile = new signals.Signal, this.signals.callHelp = new signals.Signal, this.signals.escape = new signals.Signal, this.signals.takeDamage = new signals.Signal
            }
            var Actor = require("./Actor"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Missile = require("./Missile"),
                MissileTypes = require("./MissileTypes");
            module.exports = Boss, Boss.prototype = Object.create(Actor.prototype), Boss.prototype.constructor = Boss, Boss.prototype.init = function() {
                Actor.prototype.init.call(this), this.velocity.x = this.slowSpeed, this.spine.state.setAnimationByName(0, "idle_2", !1), this.spine.state.addAnimationByName(0, "lower_2", !1, 2.2), this.spine.state.addAnimationByName(0, "idle_1", !1, 0)
            }, Boss.prototype.destroy = function() {
                this.signals.fireLaser.dispose(), this.signals.fireDisk.dispose(), this.signals.fireMissile.dispose(), Actor.prototype.destroy.call(this)
            }, Boss.prototype.update = function() {
                Actor.prototype.update.call(this), this.velocity.x += this.acceleration * p3.Timestep.deltaTime;
                var camera = Common.camera,
                    speed = this.slowSpeed;
                this.dead ? speed = this.fleeSpeed : this.x - camera.position.x < p3.View.width && (speed = this.fastSpeed), this.velocity.truncate(speed), this._active || this.velocity.x != this.fastSpeed || (this._active = !0, this.active()), this.x += this.velocity.x * p3.Timestep.deltaTime, this.y += this.velocity.y * p3.Timestep.deltaTime, this.spine.update(p3.Timestep.deltaTime)
            }, Boss.prototype.active = function() {
                Common.audio.playSound("sfx_enemy_weapon_activate_00")
            }, Boss.prototype.takeDamage = function(damage) {
                this._active && (Actor.prototype.takeDamage.call(this, damage), this.dead && !this._fleeing ? (this._fleeing = !0, this.escape()) : this._fleeing || this.signals.takeDamage.dispatch(this, damage))
            }, Boss.prototype.fireLaser = function() {
                var angle, random = Math.floor(3 * Math.random());
                switch (random) {
                    case 0:
                        angle = 0, this.spine.state.setAnimationByName(0, "laser_fire_mid", !1);
                        break;
                    case 1:
                        angle = 15, this.spine.state.setAnimationByName(0, "laser_fire_top", !1);
                        break;
                    case 2:
                        angle = -15, this.spine.state.setAnimationByName(0, "laser_fire_btm", !1)
                }
                var that = this;
                this.spine.state.onEvent = function(i, event) {
                    if ("fire_laser" == event.data.name) {
                        var laser = new PIXI.Sprite(Common.assets.getTexture("projectile_boss_laser"));
                        laser.rotation = (angle - 180) * PIXI.DEG_TO_RAD, laser.x = that.laserOffset.x + 60 * Math.cos(laser.rotation), laser.y = that.laserOffset.y + 60 * Math.sin(laser.rotation), laser.scale.x = 400, laser.anchor = new PIXI.Point(0, .5), that.addChild(laser), that.signals.fireLaser.dispatch(that, new PIXI.Point(that.x + laser.x, that.y + laser.y), laser.rotation), TweenMax.to(laser, .34, {
                            alpha: 0,
                            ease: Power1.easeInOut
                        }), TweenMax.to(laser.scale, .4, {
                            y: 0,
                            ease: Power1.easeOut
                        }), Common.audio.playSound("sfx_enemy_fire_00");
                    }
                }
            }, Boss.prototype.fireMissile = function() {
                var angle = p3.Utils.randomInt(192, 168) * PIXI.DEG_TO_RAD,
                    direction = new p3.Vector2;
                direction.x = Math.cos(angle), direction.y = Math.sin(angle);
                var missile = Missile.create(MissileTypes.BOSS_MISSILE, this, Common.player, direction);
                missile.x = this.x + this.missileOffset.x, missile.y = this.y + this.missileOffset.y, this.signals.fireMissile.dispatch(missile), this.spine.state.setAnimationByName(0, "gun_fire", !1), Common.audio.playSound("sfx_fire_missile_00")
            }, Boss.prototype.fireDisk = function() {
                this.spine.state.setAnimationByName(0, "disk_fire", !1);
                var that = this;
                this.spine.state.onEvent = function(i, event) {
                    if ("fire_disk" == event.data.name) {
                        var target = Common.player,
                            direction = new p3.Vector2(target.x - (that.x + that.diskOffset.x), target.y - (that.y + that.diskOffset.y));
                        direction.normalize(1);
                        var disk = Bullet.create(BulletTypes.BOSS_DISK, that, direction);
                        disk.x = that.x + that.diskOffset.x, disk.y = that.y + that.diskOffset.y, that.signals.fireDisk.dispatch(disk)
                    }
                }, Common.audio.playSound("sfx_ben_shoot")
            }, Boss.prototype.escape = function() {
                for (var config, emitter, x, y, i = 0; i < 4; ++i) delay(function() {
                    x = this.x + p3.Utils.randomInt(.5 * (this.aabb.x + this.aabb.width), .5 * this.aabb.x), y = this.y + p3.Utils.randomInt(.5 * (this.aabb.y + this.aabb.height), .5 * this.aabb.y), config = Common.assets.getJSON("particle_emitter_explosion_big_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(x, y), Common.animator.add(emitter), Common.audio.playSound(["sfx_boom01", "sfx_boom02", "sfx_boom03"])
                }, .42 * i, this);
                delay(function() {
                    this.signals.escape.dispatch(this)
                }, 4, this)
            }
        }, {
            "./Actor": 5,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Missile": 51,
            "./MissileTypes": 53
        }],
        17: [function(require, module, exports) {
            "use strict";

            function BossState1() {
                Boss.call(this), this.laserRateMin = 2, this.laserRateMax = 2.8, this._laserTime = 3.4, this._attackCount = 0
            }
            var Boss = require("./Boss");
            require("./Common");
            module.exports = BossState1, BossState1.prototype = Object.create(Boss.prototype), BossState1.prototype.constructor = BossState1, BossState1.prototype.init = function() {
                Boss.prototype.init.call(this)
            }, BossState1.prototype.destroy = function() {
                Boss.prototype.destroy.call(this)
            }, BossState1.prototype.update = function() {
                Boss.prototype.update.call(this), this._active && !this.dead && (this._laserTime <= 0 ? (this._laserTime = p3.Utils.randomInt(this.laserRateMax, this.laserRateMin), this.fireLaser(), this._attackCount++ % 3 == 2 && this.signals.callHelp.dispatch(this)) : this._laserTime -= p3.Timestep.deltaTime)
            }, BossState1.prototype.active = function() {
                Boss.prototype.active.call(this), this.spine.state.setAnimationByName(0, "laser_rise", !1)
            }, BossState1.prototype.escape = function() {
                this.spine.state.setAnimationByName(0, "laser_lower", !1), Boss.prototype.escape.call(this)
            }
        }, {
            "./Boss": 16,
            "./Common": 25
        }],
        18: [function(require, module, exports) {
            "use strict";

            function BossState2() {
                Boss.call(this), this.missileRateMin = 4, this.missileRateMax = 4, this.missileBurstRate = .64, this.missileBurst = 4, this._missileTime = 4, this._missileBurstTime = 0, this._missileBurstCount = 0, this._attackCount = 0
            }
            var Boss = require("./Boss");
            require("./Common"), require("./Missile"), require("./MissileTypes");
            module.exports = BossState2, BossState2.prototype = Object.create(Boss.prototype), BossState2.prototype.constructor = BossState2, BossState2.prototype.init = function() {
                Boss.prototype.init.call(this)
            }, BossState2.prototype.destroy = function() {
                Boss.prototype.destroy.call(this)
            }, BossState2.prototype.update = function() {
                Boss.prototype.update.call(this), this._active && !this.dead && (this._missileTime <= 0 ? this._missileBurstTime <= 0 ? this._missileBurstCount < this.missileBurst ? (this._missileBurstTime = this.missileBurstRate, ++this._missileBurstCount, this.fireMissile()) : (this._missileTime = p3.Utils.randomInt(this.missileRateMax, this.missileRateMin), this._missileBurstCount = 0, this._attackCount++ % 3 == 2 && this.signals.callHelp.dispatch(this)) : this._missileBurstTime -= p3.Timestep.deltaTime : this._missileTime -= p3.Timestep.deltaTime)
            }, BossState2.prototype.active = function() {
                Boss.prototype.active.call(this), this.spine.state.setAnimationByName(0, "gun_rise", !1)
            }, BossState2.prototype.escape = function() {
                this.spine.state.setAnimationByName(0, "gun_lower", !1), Boss.prototype.escape.call(this)
            }
        }, {
            "./Boss": 16,
            "./Common": 25,
            "./Missile": 51,
            "./MissileTypes": 53
        }],
        19: [function(require, module, exports) {
            "use strict";

            function BossState3() {
                Boss.call(this), this.diskBurstRate = 1, this.diskBurst = 2, this.diskOffset = new PIXI.Point(74, (-338)), this.attackRate = 3.8, this._diskBurstTime = 0, this._diskBurstCount = 0, this._attackTime = 1, this._attackCount = 0, this._swapTime = this.swapRate
            }
            var Boss = require("./Boss"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = BossState3, BossState3.prototype = Object.create(Boss.prototype), BossState3.prototype.constructor = BossState3, BossState3.prototype.init = function() {
                Boss.prototype.init.call(this)
            }, BossState3.prototype.destroy = function() {
                Boss.prototype.destroy.call(this)
            }, BossState3.prototype.update = function() {
                Boss.prototype.update.call(this), this._active && !this.dead && (this._attackTime <= 0 ? this._diskBurstTime <= 0 ? this._diskBurstCount < this.diskBurst ? (this._diskBurstTime = this.diskBurstRate, ++this._diskBurstCount, this.fireDisk()) : (this._diskBurstTime = 2 * this.diskBurstRate, this._diskBurstCount = 0, this._attackCount++ % 3 == 2 && this.signals.callHelp.dispatch(this)) : this._diskBurstTime -= p3.Timestep.deltaTime : this._attackTime -= p3.Timestep.deltaTime)
            }, BossState3.prototype.active = function() {
                Boss.prototype.active.call(this), this.spine.state.setAnimationByName(0, "disk_rise", !1)
            }, BossState3.prototype.fireDisk = function() {
                this.spine.state.setAnimationByName(0, "disk_fire", !1);
                var that = this;
                this.spine.state.onEvent = function(i, event) {
                    if ("fire_disk" == event.data.name) {
                        var target = Common.player,
                            direction = new p3.Vector2(target.x - (that.x + that.diskOffset.x), target.y - (that.y + that.diskOffset.y));
                        direction.normalize(1);
                        var disk = Bullet.create(BulletTypes.BOSS_DISK, that, direction);
                        disk.x = that.x + that.diskOffset.x, disk.y = that.y + that.diskOffset.y, that.signals.fireDisk.dispatch(disk)
                    }
                }
            }, BossState3.prototype.escape = function() {
                this.spine.state.setAnimationByName(0, "disk_lower", !1), Boss.prototype.escape.call(this)
            }
        }, {
            "./Boss": 16,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        20: [function(require, module, exports) {
            "use strict";

            function BossState4() {
                Boss.call(this), this.laserRateMin = 2, this.laserRateMax = 2.8, this.missileBurstRate = .64, this.missileBurst = 4, this.attackRate = 3.8, this.swapRate = 2, this._laserTime = 3.4, this._missileBurstTime = 0, this._missileBurstCount = 0, this._attackType = 0, this._attackTime = 1, this._attackCount = 0, this._swapTime = this.swapRate
            }
            var Boss = require("./Boss"),
                Common = (require("./Bullet"), require("./BulletTypes"), require("./Common"));
            require("./Missile"), require("./MissileTypes");
            module.exports = BossState4, BossState4.prototype = Object.create(Boss.prototype), BossState4.prototype.constructor = BossState4, BossState4.prototype.init = function() {
                Boss.prototype.init.call(this)
            }, BossState4.prototype.destroy = function() {
                Boss.prototype.destroy.call(this)
            }, BossState4.prototype.update = function() {
                if (Boss.prototype.update.call(this), this._active && !this.dead)
                    if (this._attackTime <= 0)
                        if (this._attackCount < 3) switch (this._attackType) {
                            case 0:
                                this._laserTime <= 0 ? (this._laserTime = p3.Utils.randomInt(this.laserRateMax, this.laserRateMin), this.fireLaser(), ++this._attackCount) : this._laserTime -= p3.Timestep.deltaTime;
                                break;
                            case 1:
                                this._missileBurstTime <= 0 ? this._missileBurstCount < this.missileBurst ? (this._missileBurstTime = this.missileBurstRate, ++this._missileBurstCount, this.fireMissile()) : (this._missileBurstCount = 0, ++this._attackCount) : this._missileBurstTime -= p3.Timestep.deltaTime
                        } else this._swapTime <= 0 ? (this._swapTime = this.swapRate, this._attackTime = this.attackRate, this._attackCount = 0, this.swapWeapon(), this.signals.callHelp.dispatch(this)) : this._swapTime -= p3.Timestep.deltaTime;
                        else this._attackTime -= p3.Timestep.deltaTime
            }, BossState4.prototype.active = function() {
                switch (Boss.prototype.active.call(this), this._attackType) {
                    case 0:
                        this.spine.state.setAnimationByName(0, "laser_rise", !1);
                        break;
                    case 1:
                        this.spine.state.setAnimationByName(0, "gun_rise", !1)
                }
            }, BossState4.prototype.swapWeapon = function() {
                switch (this._attackType) {
                    case 0:
                        this.spine.state.setAnimationByName(0, "laser_lower", !1);
                        break;
                    case 1:
                        this.spine.state.setAnimationByName(0, "gun_lower", !1)
                }
                switch (++this._attackType, this._attackType %= 2, this._attackType) {
                    case 0:
                        this.spine.state.addAnimationByName(0, "laser_rise", !1, 0);
                        break;
                    case 1:
                        this.spine.state.addAnimationByName(0, "gun_rise", !1, 0)
                }
                Common.audio.playSound("sfx_enemy_weapon_activate_00")
            }, BossState4.prototype.escape = function() {
                switch (this._attackType) {
                    case 0:
                        this.spine.state.setAnimationByName(0, "laser_lower", !1);
                        break;
                    case 1:
                        this.spine.state.setAnimationByName(0, "gun_lower", !1)
                }
                Boss.prototype.escape.call(this)
            }
        }, {
            "./Boss": 16,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Missile": 51,
            "./MissileTypes": 53
        }],
        21: [function(require, module, exports) {
            "use strict";

            function BossState5() {
                Boss.call(this), this.laserRateMin = 2, this.laserRateMax = 2.8, this.missileBurstRate = .64, this.missileBurst = 4, this.diskBurstRate = 1, this.diskBurst = 2, this.attackRate = 3.8, this.swapRate = 2, this._laserTime = 3.4, this._missileBurstTime = 0, this._missileBurstCount = 0, this._diskBurstTime = 0, this._diskBurstCount = 0, this._attackType = 2, this._attackTime = 1, this._attackCount = 0, this._swapTime = this.swapRate
            }
            var Boss = require("./Boss"),
                Common = (require("./Bullet"), require("./BulletTypes"), require("./Common"));
            require("./Missile"), require("./MissileTypes");
            module.exports = BossState5, BossState5.prototype = Object.create(Boss.prototype), BossState5.prototype.constructor = BossState5, BossState5.prototype.init = function() {
                Boss.prototype.init.call(this)
            }, BossState5.prototype.destroy = function() {
                Boss.prototype.destroy.call(this)
            }, BossState5.prototype.update = function() {
                if (Boss.prototype.update.call(this), this._active && !this.dead)
                    if (this._attackTime <= 0)
                        if (this._attackCount < 3) switch (this._attackType) {
                            case 0:
                                this._laserTime <= 0 ? (this._laserTime = p3.Utils.randomInt(this.laserRateMax, this.laserRateMin), this.fireLaser(), ++this._attackCount) : this._laserTime -= p3.Timestep.deltaTime;
                                break;
                            case 1:
                                this._missileBurstTime <= 0 ? this._missileBurstCount < this.missileBurst ? (this._missileBurstTime = this.missileBurstRate, ++this._missileBurstCount, this.fireMissile()) : (this._missileBurstCount = 0, ++this._attackCount) : this._missileBurstTime -= p3.Timestep.deltaTime;
                                break;
                            case 2:
                                this._diskBurstTime <= 0 ? this._diskBurstCount < this.diskBurst ? (this._diskBurstTime = this.diskBurstRate, ++this._diskBurstCount, this.fireDisk()) : (this._diskBurstTime = 2 * this.diskBurstRate, this._diskBurstCount = 0, ++this._attackCount) : this._diskBurstTime -= p3.Timestep.deltaTime
                        } else this._swapTime <= 0 ? (this._swapTime = this.swapRate, this._attackTime = this.attackRate, this._attackCount = 0, this.swapWeapon(), this.signals.callHelp.dispatch(this)) : this._swapTime -= p3.Timestep.deltaTime;
                        else this._attackTime -= p3.Timestep.deltaTime
            }, BossState5.prototype.active = function() {
                switch (Boss.prototype.active.call(this), this._attackType) {
                    case 0:
                        this.spine.state.setAnimationByName(0, "laser_rise", !1);
                        break;
                    case 1:
                        this.spine.state.setAnimationByName(0, "gun_rise", !1);
                        break;
                    case 2:
                        this.spine.state.setAnimationByName(0, "disk_rise", !1)
                }
            }, BossState5.prototype.swapWeapon = function() {
                switch (this._attackType) {
                    case 0:
                        this.spine.state.setAnimationByName(0, "laser_lower", !1);
                        break;
                    case 1:
                        this.spine.state.setAnimationByName(0, "gun_lower", !1);
                        break;
                    case 2:
                        this.spine.state.setAnimationByName(0, "disk_lower", !1)
                }
                switch (++this._attackType, this._attackType %= 3, this._attackType) {
                    case 0:
                        this.spine.state.addAnimationByName(0, "laser_rise", !1, 0);
                        break;
                    case 1:
                        this.spine.state.addAnimationByName(0, "gun_rise", !1, 0);
                        break;
                    case 2:
                        this.spine.state.addAnimationByName(0, "disk_rise", !1, 0)
                }
                Common.audio.playSound("sfx_enemy_weapon_activate_00")
            }, BossState5.prototype.escape = function() {
                switch (this._attackType) {
                    case 0:
                        this.spine.state.setAnimationByName(0, "laser_lower", !1);
                        break;
                    case 1:
                        this.spine.state.setAnimationByName(0, "gun_lower", !1);
                        break;
                    case 2:
                        this.spine.state.setAnimationByName(0, "disk_lower", !1)
                }
                Boss.prototype.escape.call(this)
            }
        }, {
            "./Boss": 16,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Missile": 51,
            "./MissileTypes": 53
        }],
        22: [function(require, module, exports) {
            "use strict";

            function Bullet(sequence, owner, direction) {
                this.owner = owner, this.damage = 1, this.splashDamage = 0, this.baseSpeed = 160, this.linearDamping = new PIXI.Point(1, 1), this.gravity = 0, this.emitter = null, this.armed = !1, this.armTime = .14, this.life = Number.MAX_VALUE, this.fireSound = null, this.fireSoundParams = new AudioParams, this.explodeSound = null, this.explodeSoundParams = new AudioParams, this.explodeOnHit = !0, this.leaveTrail = !1, this.explosionEffect = !0, this.rotateToDir = !0, this.canHit = !0, this.collatoral = !1, this._direction = direction || new p3.Vector2(1, 0), this._armTimer = null, this._explodeTimer = null, this._hits = [], Actor.call(this), this.view = new p3.MovieClip(sequence), this.view.anchor = new PIXI.Point(.5, .5), this.addChild(this.view)
            }
            var AudioParams = (require("./AI"), require("./AudioParams")),
                Actor = require("./Actor"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = Bullet, Bullet.prototype = Object.create(Actor.prototype), Bullet.prototype.constructor = Bullet, Bullet.create = function(type, owner, direction) {
                var info, damage, baseSpeed, fireSound, explodeSound, leaveTrail, life, explodeOnHit, scale = new PIXI.Point(1, 1),
                    aabb = new PIXI.Rectangle,
                    config = Common.config,
                    sequence = new p3.MovieClipSequence,
                    fireSoundParams = new AudioParams,
                    explodeSoundParams = new AudioParams;
                switch (type) {
                    case BulletTypes.DRONE_BULLET_SMALL:
                        info = config.powerups[BulletTypes.DRONE_BULLET_SMALL], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 26, aabb.height = 14, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_bullet")]);
                        break;
                    case BulletTypes.HEATBLAST_WAVE1:
                        info = config.powerups[BulletTypes.HEATBLAST_WAVE1], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !1, aabb = new PIXI.Rectangle, aabb.width = 60, aabb.height = 320, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_bomb_heatblast_001")]);
                        break;
                    case BulletTypes.HEATBLAST_WAVE2:
                        info = config.powerups[BulletTypes.HEATBLAST_WAVE1], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !1, aabb = new PIXI.Rectangle, aabb.width = 60, aabb.height = p3.View.height, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_bomb_heatblast_002")]);
                        break;
                    case BulletTypes.SPINNING_DISK:
                        info = config.powerups[BulletTypes.SPINNING_DISK], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 64, aabb.height = 40, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_disk"), Common.assets.getTexture("projectile_disk2")]);
                        break;
                    case BulletTypes.BOSS_DISK:
                        info = config.powerups[BulletTypes.BOSS_DISK], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 64, aabb.height = 40, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_boss_disk")]);
                        break;
                    case BulletTypes.FIRE_BALL1:
                        info = config.powerups[BulletTypes.FIRE_BALL1], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 64, aabb.height = 40, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_heatblast_001")]);
                        break;
                    case BulletTypes.FIRE_BALL2:
                        info = config.powerups[BulletTypes.FIRE_BALL2], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 80, aabb.height = 60, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_heatblast_002")]);
                        break;
                    case BulletTypes.FIRE_BALL3:
                        info = config.powerups[BulletTypes.FIRE_BALL3], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 80, aabb.height = 60, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_heatblast_002")]);
                        break;
                    case BulletTypes.GOO_BALL1:
                        info = config.powerups[BulletTypes.GOO_BALL1], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 64, aabb.height = 40, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_stinkfly_001")]);
                        break;
                    case BulletTypes.GOO_BALL2:
                        info = config.powerups[BulletTypes.GOO_BALL1], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 64, aabb.height = 40, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_stinkfly_001")]);
                        break;
                    case BulletTypes.GOO_BALL3:
                        info = config.powerups[BulletTypes.GOO_BALL1], damage = info.damage, baseSpeed = info.speed, life = 2, explodeOnHit = !0, aabb = new PIXI.Rectangle, aabb.width = 80, aabb.height = 60, aabb.x = .5 * -aabb.width, aabb.y = .5 * -aabb.height, sequence.addTextures([Common.assets.getTexture("projectile_stinkfly_002")])
                }
                var bullet = new Bullet(sequence, owner, direction);
                return bullet.damage = damage, bullet.baseSpeed = baseSpeed, bullet.fireSound = fireSound, bullet.fireSoundParams = fireSoundParams, bullet.explodeSound = explodeSound, bullet.explodeSoundParams = explodeSoundParams, bullet.leaveTrail = leaveTrail, bullet.life = life, bullet.explodeOnHit = explodeOnHit, bullet.aabb = aabb, bullet.view.looping = !0, bullet.view.scale = scale, bullet
            }, Bullet.prototype.init = function() {
                var deploySpeed = .6 * this.baseSpeed;
                this.velocity.x = this._direction.x * deploySpeed, this.velocity.y = this._direction.y * deploySpeed, this._explodeTimer = delay(function() {
                    this.explode(!1)
                }, this.life, this), this.view && this.view.play(), this.fireSound && Common.audio.playSound(this.fireSound, this.fireSoundParams), this.arm()
            }, Bullet.prototype.destroy = function() {
                this._armTimer && (Common.animator.remove(this._armTimer), this._armTimer.dispose(), this._armTimer = null), this._explodeTimer && (Common.animator.remove(this._explodeTimer), this._explodeTimer.dispose(), this._explodeTimer = null), this.emitter && (this.emitter.emit = !1, this.emitter = null), Actor.prototype.destroy.call(this)
            }, Bullet.prototype.update = function() {
                this.x += this.velocity.x * p3.Timestep.deltaTime, this.y += this.velocity.y * p3.Timestep.deltaTime, this.velocity.y += this.gravity * p3.Timestep.deltaTime, this.velocity.x *= this.linearDamping.x, this.velocity.y *= this.linearDamping.y, this.rotateToDir && (this.rotation = Math.atan2(this.velocity.y, this.velocity.x)), Math.abs(this.velocity.x) < 1 && (this.velocity.x = 0), Math.abs(this.velocity.y) < 1 && (this.velocity.y = 0)
            }, Bullet.prototype.arm = function() {
                this.armed = !0, this.velocity.x = this._direction.x * this.baseSpeed, this.velocity.y = this._direction.y * this.baseSpeed
            }, Bullet.prototype.collideWith = function(target) {
                if (this._hits.indexOf(target) == -1) {
                    this._hits.push(target), target.takeDamage(this.damage), this.explodeOnHit && this.explode();
                    var config = Common.assets.getJSON("particle_emitter_player_hit_00");
                    config.maxParticles = .4 * config.maxParticles;
                    var emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_player_hit_001")], config);
                    emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter)
                }
            }, Bullet.prototype.explode = function(sound) {
                sound = "boolean" != typeof sound || sound, this.takeDamage(this.currentHealth)
            }
        }, {
            "./AI": 1,
            "./Actor": 5,
            "./AudioParams": 9,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        23: [function(require, module, exports) {
            "use strict";

            function BulletTypes() {}
            module.exports = BulletTypes, BulletTypes.DRONE_BULLET_SMALL = "dronebulletsmall", BulletTypes.FIRE_BALL1 = "fireball1", BulletTypes.FIRE_BALL2 = "fireball2", BulletTypes.FIRE_BALL3 = "fireball3", BulletTypes.GOO_BALL1 = "gooball1", BulletTypes.GOO_BALL2 = "gooball2", BulletTypes.GOO_BALL3 = "gooball3", BulletTypes.HEATBLAST_WAVE1 = "heatblastwave1", BulletTypes.HEATBLAST_WAVE2 = "heatblastwave2", BulletTypes.SPINNING_DISK = "spinningdisk", BulletTypes.BOSS_DISK = "bossdisk"
        }, {}],
        24: [function(require, module, exports) {
            "use strict";

            function CNPreloaderScene() {
                this.loaded = 0, this._bar = null, this._tweens = [], p3.Scene.call(this)
            }
            var Common = require("./Common");
            module.exports = CNPreloaderScene, CNPreloaderScene.prototype = Object.create(p3.Scene.prototype), CNPreloaderScene.prototype.constructor = CNPreloaderScene, CNPreloaderScene.prototype.init = function() {
                var bg = new PIXI.Sprite(Common.assets.getTexture("cn_preloader_bg"));
                this.addChild(bg), this._bar = new PIXI.Container, this._bar.x = .5 * Common.STAGE_WIDTH + 4, this._bar.y = .5 * Common.STAGE_HEIGHT + 210, this.addChild(this._bar), this._bar.fill = new PIXI.Sprite(Common.assets.getTexture("cn_preloader_fill")), this._bar.fill.x = .5 * -this._bar.fill.texture.width, this._bar.fill.start = new PIXI.Point(this._bar.fill.x, this._bar.fill.y), this._bar.fill.anchor = new PIXI.Point(1, .5), this._bar.addChild(this._bar.fill), this._bar.frame = new PIXI.Sprite(Common.assets.getTexture("cn_preloader_overlay")), this._bar.frame.anchor = new PIXI.Point(.689, .5), this._bar.addChild(this._bar.frame)
            }, CNPreloaderScene.prototype.destroy = function() {
                for (var tween, i = 0; i < this._tweens.length; ++i) tween = this._tweens[i], tween.kill();
                this._tweens.length = 0, p3.Scene.prototype.destroy.call(this)
            }, CNPreloaderScene.prototype.show = function() {}, CNPreloaderScene.prototype.animateIn = function(callback, scope) {}, CNPreloaderScene.prototype.animateOut = function(callback, scope) {}, CNPreloaderScene.prototype.resize = function() {
                this.x = .5 * (p3.View.width - Common.STAGE_WIDTH)
            }, CNPreloaderScene.prototype.update = function() {
                this._bar.fill.x = this._bar.fill.start.x + this.loaded * this._bar.fill.texture.width
            }
        }, {
            "./Common": 25
        }],
        25: [function(require, module, exports) {
            "use strict";

            function Common() {}
            module.exports = Common, Common.STAGE_WIDTH = 1900, Common.STAGE_HEIGHT = 768, Common.stage = null, Common.renderer = null, Common.timestep = null, Common.tracking = null, Common.animator = null, Common.sceneManager = null, Common.assetManager = null, Common.audio = null, Common.camera = null, Common.player = null, Common.copy = null, Common.config = null, Common.language = "en", Common.touch = new PIXI.Point(0, 0), Common.touching = !1, Common.paused = !1, Common.isWebGL = !1, Common.currentLevel = 0, Common.currentScore = 0, Common.difficultyModifier = 0, Common.playerMorphLevel = 0, Common.playerMorphStepLevel = 0, Common.playerMorphs = [], Common.isFirstPlay = !0, Common.saveHighscore = function(value) {
                var score = parseInt(window.localStorage.getItem("cnpsscore")) || 0;
                value > score && (window.localStorage.cnpsscore = value)
            }, Common.getHighscore = function() {
                return window.localStorage.getItem("cnpsscore") || 0
            }
        }, {}],
        26: [function(require, module, exports) {
            "use strict";

            function ConfirmScene() {
                this._overlay = null, this._panel = null, this._titleText = null, this._yesButton = null, this._noButton = null, p3.Scene.call(this)
            }
            var BenButton = require("./BenButton"),
                Common = (require("./BenMuteButton"), require("./Common"));
            module.exports = ConfirmScene, ConfirmScene.prototype = Object.create(p3.Scene.prototype), ConfirmScene.prototype.constructor = ConfirmScene, ConfirmScene.prototype.init = function() {
                this._overlay = new PIXI.Graphics, this.addChild(this._overlay), this._panel = new PIXI.Sprite(Common.assets.getTexture("pop_up_are_you_sure")), this._panel.x = .5 * Common.STAGE_WIDTH, this._panel.y = .5 * Common.STAGE_HEIGHT, this._panel.anchor = new PIXI.Point(.5, .5), this.addChild(this._panel), "ar" != Common.language && "ru" != Common.language ? (this._titleText = new PIXI.extras.BitmapText(Common.copy.areyousure[Common.language], {
                    font: "64px Ahkio Green",
                    align: "center"
                }), this._titleText.x = .5 * -this._titleText.textWidth, this._titleText.y = -100, this._panel.addChild(this._titleText)) : (this._titleText = new PIXI.Text(Common.copy.areyousure[Common.language], {
                    font: "64px Arial",
                    fill: "#69FF00",
                    stroke: "#044300",
                    strokeThickness: 10,
                    align: "center"
                }), this._titleText.x = .5 * -this._titleText.width, this._titleText.y = -100, this._panel.addChild(this._titleText));
                var states = new p3.ButtonStates;
                states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_tick_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_tick_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._yesButton = new BenButton(states), this._yesButton.x = 114, this._yesButton.y = 68, this._yesButton.animate = !0, this._yesButton.overSoundName = "sfx_btn_rollover_00", this._yesButton.clickSoundName = "sfx_btn_play_00", this._yesButton.signals.click.add(this.onYesButtonClick, this), this._panel.addChild(this._yesButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_close_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_close_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._noButton = new BenButton(states), this._noButton.x = -114, this._noButton.y = 68, this._noButton.animate = !0, this._noButton.overSoundName = "sfx_btn_rollover_00", this._noButton.clickSoundName = "sfx_btn_back", this._noButton.signals.click.add(this.onNoButtonClick, this), this._panel.addChild(this._noButton), p3.Scene.prototype.init.call(this)
            }, ConfirmScene.prototype.destroy = function() {
                this._yesButton.destroy(), this._noButton.destroy(), p3.Scene.prototype.destroy.call(this)
            }, ConfirmScene.prototype.resize = function() {
                this.x = .5 * (p3.View.width - Common.STAGE_WIDTH), this._overlay.beginFill(0, .6), this._overlay.drawRect(.5 * (Common.STAGE_WIDTH - p3.View.width), 0, p3.View.width, p3.View.height), this._overlay.endFill()
            }, ConfirmScene.prototype.update = function() {}, ConfirmScene.prototype.onYesButtonClick = function(button) {
                this.signals.next.dispatch(this)
            }, ConfirmScene.prototype.onNoButtonClick = function(button) {
                this.signals.previous.dispatch(this)
            }
        }, {
            "./BenButton": 12,
            "./BenMuteButton": 13,
            "./Common": 25
        }],
        27: [function(require, module, exports) {
            "use strict";

            function DistortionEffect() {}
            module.exports = DistortionEffect, DistortionEffect.shake = function(display) {
                function animate() {
                    TweenMax.killTweensOf(filter);
                    var delay = 2 + 6 * Math.random(),
                        tl = new TimelineMax({
                            delay: delay,
                            onComplete: animate,
                            onUpdate: function() {
                                filter.time += 1
                            }
                        });
                    tl.append(TweenMax.to(filter, .2, {
                        amplitude: .14,
                        frequency: 2.4,
                        ease: Power1.easeIn,
                        yoyo: !0,
                        repeat: 1
                    })), Math.random() < .4 && (tl.append(TweenMax.to(filter, .24, {
                        amplitude: .18,
                        frequency: 2,
                        ease: Power1.easeIn,
                        yoyo: !0,
                        repeat: 1
                    })), TweenMax.to(display, .2, {
                        delay: delay,
                        alpha: .7,
                        ease: Power1.easeInOut,
                        yoyo: !0,
                        repeat: 1
                    }))
                }
                var filter = new p3.DistortionFilter(0, 0);
                animate(), display.filters ? display.filters.unshift(filter) : display.filters = [filter]
            }
        }, {}],
        28: [function(require, module, exports) {
            function DroneLarge() {
                AI.call(this), this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 96,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height - 20, width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Common = require("./Common");
            module.exports = DroneLarge, DroneLarge.prototype = Object.create(AI.prototype), DroneLarge.prototype.constructor = DroneLarge, DroneLarge.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_walk_large", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneLarge.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneLarge.prototype.update = function() {
                AI.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, DroneLarge.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Common": 25
        }],
        29: [function(require, module, exports) {
            function DroneLargeFly() {
                AI.call(this), this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 120,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, (-36), width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Common = require("./Common");
            module.exports = DroneLargeFly, DroneLargeFly.prototype = Object.create(AI.prototype), DroneLargeFly.prototype.constructor = DroneLargeFly, DroneLargeFly.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_large_flying", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneLargeFly.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneLargeFly.prototype.update = function() {
                AI.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, DroneLargeFly.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Common": 25
        }],
        30: [function(require, module, exports) {
            function DroneLargeFlyShoot() {
                AI.call(this), this.fireRate = 4.59, this.fireRate -= .2 * this.fireRate * Math.min(2, Common.difficultyModifier), this.fireOffset = new PIXI.Point((-30), (-62)), this.signals.fire = new signals.Signal, this._fireTime = 0, this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 120,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, (-36), width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = DroneLargeFlyShoot, DroneLargeFlyShoot.prototype = Object.create(AI.prototype), DroneLargeFlyShoot.prototype.constructor = DroneLargeFlyShoot, DroneLargeFlyShoot.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_large_flying_gun", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneLargeFlyShoot.prototype.destroy = function() {
                this.signals.fire.dispose(), this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneLargeFlyShoot.prototype.update = function() {
                AI.prototype.update.call(this);
                var camera = Common.camera;
                this.x < camera.position.x + p3.View.width && (this._fireTime <= 0 ? (this._fireTime = this.fireRate, this.fire()) : this._fireTime -= p3.Timestep.deltaTime), this.spine.update(p3.Timestep.deltaTime)
            }, DroneLargeFlyShoot.prototype.fire = function() {
                var bullet = Bullet.create(BulletTypes.DRONE_BULLET_SMALL, this, new p3.Vector2((-1), 0));
                bullet.x = this.x + this.fireOffset.x, bullet.y = this.y + this.fireOffset.y, this.signals.fire.dispatch(bullet)
            }, DroneLargeFlyShoot.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        31: [function(require, module, exports) {
            function DroneLargeShoot() {
                AI.call(this), this.fireRate = 4.59, this.fireRate -= .2 * this.fireRate * Math.min(2, Common.difficultyModifier), this.fireOffset = new PIXI.Point((-26), (-34)), this.signals.fire = new signals.Signal, this._fireTime = 0, this._loopSFX = null;
                var holder = new PIXI.Container;
                holder.y = 60, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine), this._turret = new PIXI.Sprite(Common.assets.getTexture("enemy_drone_gun")), this._turret.x = -2, this._turret.y = -40, this._turret.anchor = new PIXI.Point(.5, .5), this.addChild(this._turret);
                var width = 120,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height, width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = DroneLargeShoot, DroneLargeShoot.prototype = Object.create(AI.prototype), DroneLargeShoot.prototype.constructor = DroneLargeShoot, DroneLargeShoot.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_walk_large_gun", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneLargeShoot.prototype.destroy = function() {
                this.signals.fire.dispose(), this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneLargeShoot.prototype.update = function() {
                AI.prototype.update.call(this);
                var target = Common.player;
                if (target) {
                    var to = new p3.Vector2(target.x - this.x + this._turret.x, target.y - this.y + this._turret.y);
                    this._turret.rotation = Math.atan2(to.y, to.x) - Math.PI;
                    var camera = Common.camera;
                    this.x < camera.position.x + p3.View.width && (this._fireTime <= 0 ? (this._fireTime = this.fireRate, this.fire()) : this._fireTime -= p3.Timestep.deltaTime)
                }
                this.spine.update(p3.Timestep.deltaTime)
            }, DroneLargeShoot.prototype.fire = function() {
                var angle = this._turret.rotation - Math.PI,
                    direction = new p3.Vector2(Math.cos(angle), Math.sin(angle)),
                    bullet = Bullet.create(BulletTypes.DRONE_BULLET_SMALL, this, direction);
                bullet.x = this.x + this._turret.x, bullet.y = this.y + this._turret.y, this.signals.fire.dispatch(bullet)
            }, DroneLargeShoot.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        32: [function(require, module, exports) {
            function DroneLargeSpinner() {
                AI.call(this), this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 96,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height - 20, width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Common = require("./Common");
            module.exports = DroneLargeSpinner, DroneLargeSpinner.prototype = Object.create(AI.prototype), DroneLargeSpinner.prototype.constructor = DroneLargeSpinner, DroneLargeSpinner.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_flying_disk_2", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneLargeSpinner.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneLargeSpinner.prototype.update = function() {
                AI.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, DroneLargeSpinner.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Common": 25
        }],
        33: [function(require, module, exports) {
            function DroneSmall() {
                AI.call(this), this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 96,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height - 20, width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Common = require("./Common");
            module.exports = DroneSmall, DroneSmall.prototype = Object.create(AI.prototype), DroneSmall.prototype.constructor = DroneSmall, DroneSmall.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_walk_small", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneSmall.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneSmall.prototype.update = function() {
                AI.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, DroneSmall.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Common": 25
        }],
        34: [function(require, module, exports) {
            function DroneSmallFly() {
                AI.call(this), this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 96,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height - 12, width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Common = require("./Common");
            module.exports = DroneSmallFly, DroneSmallFly.prototype = Object.create(AI.prototype), DroneSmallFly.prototype.constructor = DroneSmallFly, DroneSmallFly.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_small_flying", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneSmallFly.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneSmallFly.prototype.update = function() {
                AI.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, DroneSmallFly.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Common": 25
        }],
        35: [function(require, module, exports) {
            function DroneSmallFlyShoot() {
                AI.call(this), this.fireRate = 4.59, this.fireRate -= .2 * this.fireRate * Math.min(2, Common.difficultyModifier), this.fireOffset = new PIXI.Point((-30), (-62)), this.signals.fire = new signals.Signal, this._fireTime = 0, this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 96,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width - 2, (-40), width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = DroneSmallFlyShoot, DroneSmallFlyShoot.prototype = Object.create(AI.prototype), DroneSmallFlyShoot.prototype.constructor = DroneSmallFlyShoot, DroneSmallFlyShoot.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_small_flying_gun", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneSmallFlyShoot.prototype.destroy = function() {
                this.signals.fire.dispose(), this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneSmallFlyShoot.prototype.update = function() {
                AI.prototype.update.call(this);
                var camera = Common.camera;
                this.x < camera.position.x + p3.View.width && (this._fireTime <= 0 ? (this._fireTime = this.fireRate, this.fire()) : this._fireTime -= p3.Timestep.deltaTime), this.spine.update(p3.Timestep.deltaTime)
            }, DroneSmallFlyShoot.prototype.fire = function() {
                var bullet = Bullet.create(BulletTypes.DRONE_BULLET_SMALL, this, new p3.Vector2((-1), 0));
                bullet.x = this.x + this.fireOffset.x, bullet.y = this.y + this.fireOffset.y, this.signals.fire.dispatch(bullet)
            }, DroneSmallFlyShoot.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        36: [function(require, module, exports) {
            function DroneSmallShoot() {
                AI.call(this), this.fireRate = 4.59, this.fireRate -= .2 * this.fireRate * Math.min(2, Common.difficultyModifier), this.fireOffset = new PIXI.Point((-26), (-34)), this.signals.fire = new signals.Signal, this._fireTime = 0, this._loopSFX = null;
                var holder = new PIXI.Container;
                holder.y = 60, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine), this._turret = new PIXI.Sprite(Common.assets.getTexture("enemy_drone_gun")), this._turret.x = -2, this._turret.y = -40, this._turret.anchor = new PIXI.Point(.5, .5), this.addChild(this._turret);
                var width = 120,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height - 4, width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = DroneSmallShoot, DroneSmallShoot.prototype = Object.create(AI.prototype), DroneSmallShoot.prototype.constructor = DroneSmallShoot, DroneSmallShoot.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_walk_small_gun", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneSmallShoot.prototype.destroy = function() {
                this.signals.fire.dispose(), this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneSmallShoot.prototype.update = function() {
                AI.prototype.update.call(this);
                var target = Common.player;
                if (target) {
                    var to = new p3.Vector2(target.x - this.x + this._turret.x, target.y - this.y + this._turret.y);
                    this._turret.rotation = Math.atan2(to.y, to.x) - Math.PI;
                    var camera = Common.camera;
                    this.x < camera.position.x + p3.View.width && (this._fireTime <= 0 ? (this._fireTime = this.fireRate, this.fire()) : this._fireTime -= p3.Timestep.deltaTime)
                }
                this.spine.update(p3.Timestep.deltaTime)
            }, DroneSmallShoot.prototype.fire = function() {
                var angle = this._turret.rotation - Math.PI,
                    direction = new p3.Vector2(Math.cos(angle), Math.sin(angle)),
                    bullet = Bullet.create(BulletTypes.DRONE_BULLET_SMALL, this, direction);
                bullet.x = this.x + this._turret.x, bullet.y = this.y + this._turret.y, this.signals.fire.dispatch(bullet)
            }, DroneSmallShoot.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        37: [function(require, module, exports) {
            function DroneSmallSpinner() {
                AI.call(this), this._loopSFX = null, this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("drones")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), this.addChild(this.spine);
                var width = 96,
                    height = 60;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height - 20, width, height)
            }
            var AI = require("./AI"),
                AudioParams = require("./AudioParams"),
                Common = require("./Common");
            module.exports = DroneSmallSpinner, DroneSmallSpinner.prototype = Object.create(AI.prototype), DroneSmallSpinner.prototype.constructor = DroneSmallSpinner, DroneSmallSpinner.prototype.init = function() {
                AI.prototype.init.call(this), this.spine.state.setAnimationByName(0, "drone_flying_disk_1", !0);
                var params = new AudioParams;
                params.volume = .4, params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03"], params)
            }, DroneSmallSpinner.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), AI.prototype.destroy.call(this)
            }, DroneSmallSpinner.prototype.update = function() {
                AI.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, DroneSmallSpinner.prototype.takeDamage = function(damage, animate) {
                AI.prototype.takeDamage.call(this, damage, animate);
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_drone_explode_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_drone_001"), Common.assets.getTexture("particle_drone_002"), Common.assets.getTexture("particle_drone_003"), Common.assets.getTexture("particle_drone_004"), Common.assets.getTexture("particle_drone_005"), Common.assets.getTexture("particle_drone_006"), Common.assets.getTexture("particle_drone_007"), Common.assets.getTexture("particle_drone_008")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), config.maxParticles = .4 * config.maxParticles, emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter), this.dead ? Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"]) : Common.audio.playSound("sfx_drone_impact_00")
            }
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Common": 25
        }],
        38: [function(require, module, exports) {
            "use strict";

            function GameScene() {
                this._hud = null, this._world = null, this._debug = null, this._spawner = null, this._player = null, this._boss = null, this._focus = null, this._enemies = [], this._bosses = [], this._bullets = [], this._powerups = [], this._running = !1, this._respawning = !1, this._score = 0, this._bossIndex = 0, this._startedBoss = !1, this._totalBossHealth = 0, this._splatLayer = null, this._transformationEffect = null, p3.Scene.call(this)
            }
            var AI = require("./AI"),
                AIPath = require("./AIPath"),
                AITypes = require("./AITypes"),
                AudioParams = require("./AudioParams"),
                Ben1 = require("./Ben1"),
                Ben2 = require("./Ben2"),
                BombTypes = require("./BombTypes"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Hud = require("./Hud"),
                Missile = require("./Missile"),
                Powerup = (require("./Player"), require("./Powerup")),
                PowerupTypes = require("./PowerupTypes"),
                PreloaderScene = require("./PreloaderScene"),
                Spawner = require("./Spawner"),
                SpawnerCreep = require("./SpawnerCreep"),
                SpawnerGroup = require("./SpawnerGroup"),
                TransformationEffect = require("./TransformationEffect"),
                World = require("./World"),
                GooRadialBomb = require("./GooRadialBomb"),
                GooSplatBomb = require("./GooSplatBomb"),
                HeatwaveBomb = require("./HeatwaveBomb"),
                MissileBomb = require("./MissileBomb"),
                ShockwaveBomb = require("./ShockwaveBomb"),
                Heatblast1 = require("./Heatblast1"),
                Heatblast2 = require("./Heatblast2"),
                Heatblast3 = require("./Heatblast3"),
                Stinkfly1 = require("./Stinkfly1"),
                Stinkfly2 = require("./Stinkfly2"),
                Stinkfly3 = require("./Stinkfly3"),
                BossState1 = require("./BossState1"),
                BossState2 = require("./BossState2"),
                BossState3 = require("./BossState3"),
                BossState4 = require("./BossState4"),
                BossState5 = require("./BossState5"),
                DroneSmall = require("./DroneSmall"),
                DroneSmallShoot = require("./DroneSmallShoot"),
                DroneSmallFly = require("./DroneSmallFly"),
                DroneSmallFlyShoot = require("./DroneSmallFlyShoot"),
                DroneSmallSpinner = require("./DroneSmallSpinner"),
                DroneLarge = require("./DroneLarge"),
                DroneLargeShoot = require("./DroneLargeShoot"),
                DroneLargeFly = require("./DroneLargeFly"),
                DroneLargeFlyShoot = require("./DroneLargeFlyShoot"),
                DroneLargeSpinner = require("./DroneLargeSpinner");
            module.exports = GameScene, GameScene.prototype = Object.create(p3.Scene.prototype), GameScene.prototype.constructor = GameScene, GameScene.prototype.preloader = function() {
                return new PreloaderScene
            }, GameScene.prototype.load = function() {
                return [{
                    name: "game_bg_001",
                    url: "images/game_bg_001.jpg"
                }, {
                    name: "game_bg_002",
                    url: "images/game_bg_002.jpg"
                }, {
                    name: "game_bg_003",
                    url: "images/game_bg_003.jpg"
                }, {
                    name: "game_bg_004",
                    url: "images/game_bg_004.jpg"
                }, {
                    name: "game_0",
                    url: "images/game_0.json"
                }, {
                    name: "game_1",
                    url: "images/game_1.json"
                }, {
                    name: "ben",
                    url: "images/char_ben.json"
                }, {
                    name: "heatblast",
                    url: "images/char_heatblast.json"
                }, {
                    name: "stinkfly",
                    url: "images/char_stinkfly.json"
                }, {
                    name: "drones",
                    url: "images/char_drones.json"
                }, {
                    name: "boss",
                    url: "images/char_boss.json"
                }, {
                    name: "transform_0",
                    url: "images/transform_0.json"
                }]
            }, GameScene.prototype.unload = function() {
                Common.assets
            }, GameScene.prototype.init = function() {
                Common.currentLevel % 2 ? Common.playerMorphs = [{
                    steps: 0,
                    spacing: 0,
                    icon: "game_ui_powerbar_icon_fill_ben_001"
                }, {
                    steps: 0,
                    spacing: .2,
                    icon: "game_ui_powerbar_icon_fill_ben_002"
                }, {
                    steps: 1,
                    spacing: .44,
                    icon: "game_ui_powerbar_icon_fill_stinkfly_001"
                }, {
                    steps: 2,
                    spacing: .7,
                    icon: "game_ui_powerbar_icon_fill_stinkfly_002"
                }, {
                    steps: 0,
                    spacing: 1,
                    icon: "game_ui_powerbar_icon_fill_stinkfly_003"
                }] : Common.playerMorphs = [{
                    steps: 0,
                    spacing: 0,
                    icon: "game_ui_powerbar_icon_fill_ben_001"
                }, {
                    steps: 0,
                    spacing: .2,
                    icon: "game_ui_powerbar_icon_fill_ben_002"
                }, {
                    steps: 1,
                    spacing: .44,
                    icon: "game_ui_powerbar_icon_fill_heatblast_001"
                }, {
                    steps: 2,
                    spacing: .7,
                    icon: "game_ui_powerbar_icon_fill_heatblast_002"
                }, {
                    steps: 0,
                    spacing: 1,
                    icon: "game_ui_powerbar_icon_fill_heatblast_003"
                }], Common.playerMorphLevel = 1, Common.playerMorphStepLevel = 0;
                var camera = new p3.Camera(new PIXI.Point(.5 * p3.View.width - 320, .5 * p3.View.height), (!0));
                camera.bounds.y = camera.view.y, camera.bounds.height = camera.view.y, camera.bounds.left = 60, camera.bounds.right = 160, camera.trackEase = .2, Common.camera = camera;
                var data = Common.config.levels[Common.currentLevel % Common.config.levels.length],
                    level = Common.assets.getJSON(data.name);
                this._world = new World(camera), this._world.parseLevel(level), this.addChild(this._world), this._debug = new PIXI.Graphics, this.addChild(this._debug), this._spawner = new Spawner(camera), this._spawner.parseLevel(level), this._spawner.signals.spawn.add(this.onSpawnCreep, this), this._player = this.createPlayer(0), this._player.x = 0, this._player.y = 340, this._world.game.addChild(this._player), this.morphPlayer(Common.playerMorphLevel), this._focus = new PIXI.Point(this._player.x, this._player.y), this._world.camera.trackTarget(this._focus, !0), this._splatLayer = new PIXI.Container, this.addChild(this._splatLayer), this._hud = new Hud, this._hud.signals.pause.add(this.onPauseButtonClick, this), this._hud.signals.fire.add(this.onFireButton, this), this._hud.joystick.signals.input.add(this.onJoystickInput, this), this.addChild(this._hud), this._score = Common.currentScore, this._hud.score = Common.currentScore, this.start()
            }, GameScene.prototype.destroy = function() {
                Common.animator.removeAll(), TweenMax.killAll(), this._player.destroy(), this._hud.destroy();
                var i;
                for (i = 0; i < this._enemies.length; ++i) this._enemies[i].destroy();
                for (i = 0; i < this._bosses.length; ++i) this._bosses[i].destroy();
                for (i = 0; i < this._bullets.length; ++i) this._bullets[i].destroy();
                for (i = 0; i < this._powerups.length; ++i) this._powerups[i].destroy();
                p3.Scene.prototype.destroy.call(this)
            }, GameScene.prototype.start = function() {
                this._running = !0, this._hud.showLevelBanner(), this._totalBossHealth = this.calculateBossTotalHealth(), console.log(this._totalBossHealth), Common.audio.playSound("sfx_omnitrix_transform_back_00")
            }, GameScene.prototype.end = function() {
                this._running = !1, this.signals.next.dispatch(this, this._score, !this._player.dead)
            }, GameScene.prototype.appear = function() {
                this.animateIn(), Common.isFirstPlay && (this.signals.pause.dispatch(this, !1), Common.isFirstPlay = !1);
                var params = new AudioParams;
                params.fadeIn = .5, Common.audio.playMusic("music_ben10_powersurge_final", params)
            }, GameScene.prototype.show = function() {}, GameScene.prototype.animateIn = function(callback, scope) {}, GameScene.prototype.animateOut = function(callback, scope) {}, GameScene.prototype.resize = function() {
                this._hud.resize(), this._world.resize()
            }, GameScene.prototype.update = function() {
                if (!Common.animator.paused || !this._running) {
                    this._world.update(), this._world.camera.update();
                    var x = this._world.camera.position.x + p3.View.width;
                    if (this._spawner.update(x), this._running && x >= this._world.length && !this._startedBoss && (this._startedBoss = !0, this.nextBoss()), this._boss && this._player.x > this._boss.x - 400 && (this._player.velocity.x = 0, this._player.x = this._boss.x - 400), this.updatePlayer(), this.updateEnemies(), this.updateBosses(), this.updateBullets(), this.handleCollisions(), !this._player.dead) {
                        x = this._player.x - this._world.camera.position.x, x < 0 ? (this._player.velocity.x = 0, this._player.x = this._world.camera.position.x) : x > p3.View.width && (this._player.velocity.x = 0, this._player.x = this._world.camera.position.x + p3.View.width);
                        var y = this._player.y - this._world.camera.position.y;
                        y < 0 ? (this._player.velocity.y = 0,
                            this._player.y = this._world.camera.position.y) : y > p3.View.height + 20 && (this._player.velocity.y = 0, this._player.y = p3.View.height + 20 + this._world.camera.position.y)
                    }
                    this._transformationEffect && (this._transformationEffect.x = this._player.x, this._transformationEffect.y = this._player.y - 14, this._transformationEffect.update()), this._hud.update()
                }
            }, GameScene.prototype.nextBoss = function() {
                var data = Common.config.levels[Common.currentLevel % Common.config.levels.length].boss;
                if (this._bossIndex < data.length) {
                    this._boss && (this._boss.destroyNextFrame = !0);
                    var info;
                    switch (data[this._bossIndex]) {
                        case 1:
                            info = Common.config.creeps.boss1, this._boss = new BossState1, this._boss.health = info.health;
                            break;
                        case 2:
                            info = Common.config.creeps.boss2, this._boss = new BossState2, this._boss.health = info.health;
                            break;
                        case 3:
                            info = Common.config.creeps.boss3, this._boss = new BossState3, this._boss.health = info.health;
                            break;
                        case 4:
                            info = Common.config.creeps.boss4, this._boss = new BossState4, this._boss.health = info.health;
                            break;
                        case 5:
                            info = Common.config.creeps.boss5, this._boss = new BossState5, this._boss.health = info.health
                    }
                    this._boss.x = this._player.x + 1600, this._boss.y = 540, this._boss.signals.fireLaser.add(this.onBossFireLaser, this), this._boss.signals.fireMissile.add(this.addBullet, this), this._boss.signals.fireDisk.add(this.addBullet, this), this._boss.signals.callHelp.add(this.onBossCallHelp, this), this._boss.signals.escape.add(this.nextBoss, this), this._boss.signals.takeDamage.add(this.onBossTakeDamage, this), this._world.game.addChild(this._boss), this._bosses.push(this._boss), ++this._bossIndex
                } else this.end();
                this._hud.showBossHealth()
            }, GameScene.prototype.calculateBossTotalHealth = function() {
                for (var info, health = 0, data = Common.config.levels[Common.currentLevel % Common.config.levels.length].boss, i = 0; i < data.length; ++i) switch (data[i]) {
                    case 1:
                        info = Common.config.creeps.boss1, health += info.health;
                        break;
                    case 2:
                        info = Common.config.creeps.boss2, health += info.health;
                        break;
                    case 3:
                        info = Common.config.creeps.boss3, health += info.health;
                        break;
                    case 4:
                        info = Common.config.creeps.boss4, health += info.health;
                        break;
                    case 5:
                        info = Common.config.creeps.boss5, health += info.health
                }
                return health
            }, GameScene.prototype.updatePlayer = function() {
                this._focus.x += this._player.scrollRate * p3.Timestep.deltaTime, this._focus.y = this._player.y, this._player.dead ? this._player.y += 220 * p3.Timestep.deltaTime : this._player.x += this._player.scrollRate * p3.Timestep.deltaTime, this._player.update()
            }, GameScene.prototype.updateEnemies = function() {
                for (var enemy, x, i = this._enemies.length - 1; i >= 0; --i) enemy = this._enemies[i], x = enemy.x - Common.camera.position.x, !enemy.dead && x > -enemy.width ? (enemy.update(), enemy.renderable = x > -enemy.width && x < p3.View.width + enemy.width) : (enemy.parent.removeChild(enemy), enemy.destroy(), this._enemies.splice(i, 1))
            }, GameScene.prototype.updateBosses = function() {
                for (var boss, i = this._bosses.length - 1; i >= 0; --i) boss = this._bosses[i], boss.destroyNextFrame ? (boss.parent.removeChild(boss), boss.destroy(), this._bosses.splice(i, 1)) : boss.update()
            }, GameScene.prototype.updateBullets = function() {
                for (var bullet, x, i = this._bullets.length - 1; i >= 0; --i) bullet = this._bullets[i], bullet.dead ? (bullet.parent.removeChild(bullet), bullet.destroy(), this._bullets.splice(i, 1)) : (bullet.update(), x = bullet.x - Common.camera.position.x, bullet.visible = x > -bullet.width && x < p3.View.width + bullet.width)
            }, GameScene.prototype.updatePowerups = function() {
                for (var powerup, x, i = this._powerups.length - 1; i >= 0; --i) powerup = this._powerups[i], x = powerup.x - Common.camera.position.x, !powerup.dead && x > -powerup.width ? (powerup.update(), powerup.renderable = x > -powerup.width && x < p3.View.width + powerup.width) : (powerup.parent.removeChild(powerup), powerup.destroy(), this._powerups.splice(i, 1))
            }, GameScene.prototype.handleCollisions = function() {
                var bullet, target, i, j, enemies = this._enemies.concat(this._bosses);
                for (i = 0; i < this._bullets.length; ++i)
                    if (bullet = this._bullets[i], bullet.x - this._world.camera.position.x < p3.View.width && bullet.owner == this._player)
                        for (j = 0; j < enemies.length; ++j) target = enemies[j], target != bullet.owner && this.isIntersecting(bullet, target) && bullet.collideWith(target);
                if (this._player && !this._player.dead) {
                    var actor;
                    for (i = 0; i < this._enemies.length; ++i)
                        if (actor = this._enemies[i], actor != this._player && actor instanceof AI && !this._player.invulnerable && this.isIntersecting(actor, this._player)) {
                            this.explodePlayer();
                            break
                        }
                    for (i = 0; i < this._bullets.length; ++i)
                        if (bullet = this._bullets[i], bullet.x - this._world.camera.position.x < p3.View.width && bullet.owner != this._player && !this._player.invulnerable && this.isIntersecting(bullet, this._player)) {
                            this.explodePlayer(), bullet.collideWith(this._player);
                            break
                        }
                    var powerup;
                    for (i = 0; i < this._powerups.length; ++i) powerup = this._powerups[i], powerup && powerup.parent && this.isIntersecting(powerup, this._player) && powerup.collect(this._player)
                }
            }, GameScene.prototype.createPlayer = function(level) {
                var player;
                if (Common.currentLevel % 2) switch (level) {
                    case 0:
                        player = new Ben1;
                        break;
                    case 1:
                        player = new Ben2;
                        break;
                    case 2:
                        player = new Stinkfly1;
                        break;
                    case 3:
                        player = new Stinkfly2;
                        break;
                    case 4:
                        player = new Stinkfly3
                } else switch (level) {
                    case 0:
                        player = new Ben1;
                        break;
                    case 1:
                        player = new Ben2;
                        break;
                    case 2:
                        player = new Heatblast1;
                        break;
                    case 3:
                        player = new Heatblast2;
                        break;
                    case 4:
                        player = new Heatblast3
                }
                return player
            }, GameScene.prototype.explodePlayer = function() {
                this._player.dead || (this._world.camera.shake(.6, 100), Common.playerMorphLevel-- > 0 ? (Common.playerMorphStepLevel = 0, this.morphPlayer(Common.playerMorphLevel), this._hud.alienBar.downgrade(!0), this.respawnPlayer()) : (this._player.velocity.x = .4 * this._player.speed, this._player.linearDamping = .986, this._player.takeDamage(Number.MAX_VALUE), this._player.deathAnimation(), delay(function() {
                    this.end()
                }, 1.4, this), Common.audio.playSound(["sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04"])), this._player.visible && (Common.audio.playSound(["vo_ben_surprise_00", "vo_ben_hurt_00", "vo_ben_oohoof_00"]), Common.audio.playSound("sfx_drone_impact_00")))
            }, GameScene.prototype.respawnPlayer = function() {
                this._player.reset(), this._player.makeInvulnerable(2)
            }, GameScene.prototype.morphPlayer = function(level, animate) {
                var position = new PIXI.Point(this._player.x, this._player.y),
                    velocity = this._player.velocity.clone(),
                    rotation = this._player.rotation,
                    last = this._player;
                this._player.parent.removeChild(this._player), this._player.destroy(), this._player = this.createPlayer(level), this._player.x = position.x, this._player.y = position.y, this._player.velocity.x = velocity.x, this._player.velocity.y = velocity.y, this._player.rotation = rotation, this._player.health = 1, this._player.signals.fire.add(this.createBullet, this), this._world.game.addChild(this._player), Common.player = this._player, this._player.makeInvulnerable(2);
                for (var bullet, i = 0; i < this._bullets.length; ++i) bullet = this._bullets[i], bullet.owner == last && (bullet.owner = this._player);
                this._transformationEffect && (this._transformationEffect.parent.removeChild(this._transformationEffect), this._transformationEffect = null), animate && (this._transformationEffect = new TransformationEffect, this._transformationEffect.x = this._player.x, this._transformationEffect.y = this._player.y, this._transformationEffect.animate(), this._player.parent.addChild(this._transformationEffect), Common.audio.playSound("sfx_omnitrix_transform_00"))
            }, GameScene.prototype.activateBomb = function(type, owner, position) {
                var bomb, count, targets;
                switch (type) {
                    case BombTypes.SHOCKWAVE:
                        bomb = new ShockwaveBomb(this._player), targets = this.findRadialTargets(new PIXI.Point(this._player.x, this._player.y), 360), bomb.activate(this._world.game, position, targets);
                        break;
                    case BombTypes.MISSILE:
                        bomb = new MissileBomb(this._player), bomb.signals.fire.add(function(missile) {
                            this.addBullet(missile)
                        }, this), count = 8, targets = this.findClosestTargets(new PIXI.Point(this._player.x, this._player.y), count), bomb.activate(position, targets, count);
                        break;
                    case BombTypes.HEATBLAST_WAVE1:
                        bomb = new HeatwaveBomb(this._player), bomb.signals.fire.add(function(wave) {
                            this.addBullet(wave)
                        }, this), bomb.activate(BulletTypes.HEATBLAST_WAVE1, position);
                        break;
                    case BombTypes.HEATBLAST_WAVE2:
                        bomb = new HeatwaveBomb(this._player), bomb.signals.fire.add(function(wave) {
                            this.addBullet(wave)
                        }, this), bomb.activate(BulletTypes.HEATBLAST_WAVE2, new PIXI.Point(position.x, .5 * Common.STAGE_HEIGHT));
                        break;
                    case BombTypes.GOO_RADIAL:
                        bomb = new GooRadialBomb(this._player), bomb.signals.fire.add(function(bullet) {
                            this.addBullet(bullet)
                        }, this), bomb.activate(position, 8);
                        break;
                    case BombTypes.GOO_SPLAT:
                        bomb = new GooSplatBomb(this._player), targets = this.findScreenTargets(), bomb.activate(this._splatLayer, targets)
                }
            }, GameScene.prototype.createEnemy = function(type, group, position) {
                var enemy, info, modifier = Common.difficultyModifier;
                switch (type) {
                    case AITypes.DRONE_SMALL_FLY:
                        info = Common.config.creeps.dronesmallfly, enemy = new DroneSmallFly, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier;
                        break;
                    case AITypes.DRONE_SMALL_FLY_SHOOT:
                        info = Common.config.creeps.dronesmallflyshoot, enemy = new DroneSmallFlyShoot, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier, enemy.signals.fire.add(this.addBullet, this);
                        break;
                    case AITypes.DRONE_SMALL:
                        info = Common.config.creeps.dronesmall, enemy = new DroneSmall, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier;
                        break;
                    case AITypes.DRONE_SMALL_SHOOT:
                        info = Common.config.creeps.dronesmallshoot, enemy = new DroneSmallShoot(this._player), enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier, enemy.signals.fire.add(this.addBullet, this);
                        break;
                    case AITypes.DRONE_SMALL_SPINNER:
                        info = Common.config.creeps.dronesmallspinner, enemy = new DroneSmallSpinner, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier;
                        break;
                    case AITypes.DRONE_LARGE_FLY:
                        info = Common.config.creeps.dronelargefly, enemy = new DroneLargeFly, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier;
                        break;
                    case AITypes.DRONE_LARGE_FLY_SHOOT:
                        info = Common.config.creeps.dronelargeflyshoot, enemy = new DroneLargeFlyShoot, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier, enemy.signals.fire.add(this.addBullet, this);
                        break;
                    case AITypes.DRONE_LARGE:
                        info = Common.config.creeps.dronelarge, enemy = new DroneLarge, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier;
                        break;
                    case AITypes.DRONE_LARGE_SHOOT:
                        info = Common.config.creeps.dronelargeshoot, enemy = new DroneLargeShoot, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier, enemy.signals.fire.add(this.addBullet, this);
                        break;
                    case AITypes.DRONE_LARGE_SPINNER:
                        info = Common.config.creeps.dronelargespinner, enemy = new DroneLargeSpinner, enemy.health = info.health + modifier, enemy.baseSpeed = info.speed, enemy.faceDir = info.faceDir, enemy.value = info.value + modifier
                }
                return enemy.x = position.x, enemy.y = position.y, enemy.group = group, enemy.signals.dead.add(this.onEnemyDead, this), this.addEnemy(enemy), enemy
            }, GameScene.prototype.createBullet = function(type, owner, position, rotation, direction) {
                var bullet = Bullet.create(type, owner, direction);
                return bullet.x = position.x, bullet.y = position.y, bullet.rotation = rotation, this.addBullet(bullet), bullet
            }, GameScene.prototype.createMissile = function(type, owner, target, position, rotation, direction) {
                var missile = Missile.create(type, owner, target, direction);
                return missile.x = position.x, missile.y = position.y, missile.rotation = rotation, this.addBullet(missile), missile
            }, GameScene.prototype.addEnemy = function(enemy) {
                return this._world.game.addChildAt(enemy, this._world.game.getChildIndex(this._player)), this._enemies.push(enemy), enemy
            }, GameScene.prototype.addBullet = function(bullet) {
                return this._world.game.addChildAt(bullet, this._world.game.getChildIndex(bullet.owner) + 1), this._bullets.push(bullet), bullet
            }, GameScene.prototype.createPowerup = function(type, position) {
                var level;
                switch (type) {
                    case PowerupTypes.ALIEN_UPGRADE:
                        level = this._playerMorphLevel + 1
                }
                var powerup = new Powerup(type, level);
                powerup.x = position.x, powerup.y = position.y, powerup.signals.collect.add(this.onPowerupCollect, this), this._world.game.addChild(powerup), this._powerups.push(powerup)
            }, GameScene.prototype.isIntersecting = function(a, b) {
                return !(b.x + b.aabb.x > a.x + a.aabb.x + a.aabb.width || b.x + b.aabb.x + b.aabb.width < a.x + a.aabb.x || b.y + b.aabb.y > a.y + a.aabb.y + a.aabb.height || b.y + b.aabb.y + b.aabb.height < a.y + a.aabb.y)
            }, GameScene.prototype.drawAABBs = function() {
                var arr = this._enemies.concat([this._player], this._bullets, this._bosses);
                this._debug.clear();
                for (var actor, camera = Common.camera, i = 0; i < arr.length; ++i) actor = arr[i], this._debug.beginFill(255, .4), this._debug.drawRect(actor.x + actor.aabb.x - camera.position.x, actor.y + actor.aabb.y - camera.position.y, actor.aabb.width, actor.aabb.height), this._debug.endFill()
            }, GameScene.prototype.findClosestTargets = function(position, count) {
                for (var enemy, to, distance, closest, closestDistance, closestIndex, enemies = this._enemies.slice(), result = []; result.length < count && enemies.length;) {
                    closestDistance = Number.MAX_VALUE;
                    for (var i = 0; i < enemies.length; ++i) enemy = enemies[i], to = new p3.Vector2(enemy.x - position.x, enemy.y - position.y), distance = to.length, distance < closestDistance && (closest = enemy, closestDistance = distance, closestIndex = i);
                    enemies.splice(closestIndex, 1), result.push(closest)
                }
                return result
            }, GameScene.prototype.findRadialTargets = function(position, radius) {
                for (var enemy, to, distance, enemies = this._enemies.slice(), result = [], i = 0; i < enemies.length; ++i) enemy = enemies[i], to = new p3.Vector2(enemy.x - position.x, enemy.y - position.y), distance = to.length, distance <= radius && result.push(enemy);
                return result
            }, GameScene.prototype.findScreenTargets = function() {
                for (var enemy, camera = Common.camera, enemies = this._enemies.slice(), result = [], i = 0; i < enemies.length; ++i) enemy = enemies[i], enemy.x - camera.position.x > 0 && enemy.x - camera.position.x < p3.View.width && result.push(enemy);
                return result
            }, GameScene.prototype.addScore = function(value, position, multiplier) {
                this._score += value, this._hud.score = this._score, Common.currentScore += value, position && this._hud.addScorePopup(position, value, multiplier)
            }, GameScene.prototype.onSpawnCreep = function(creep) {
                var enemy = this.createEnemy(creep.type, creep.group, creep.position.clone());
                if (enemy instanceof AI) {
                    var data = Common.config.levels[Common.currentLevel % Common.config.levels.length];
                    if (data = Common.assets.getJSON(data.path), "" != creep.path) {
                        var path = new AIPath;
                        path.parsePath(data.paths[creep.path]), enemy.setPath(path)
                    }
                }
            }, GameScene.prototype.onEnemyDead = function(enemy) {
                var group = enemy.group;
                group && ++group.killed >= group.creeps.length && group.powerup != -1 && this.createPowerup(group.powerup, new PIXI.Point(enemy.x, enemy.y));
                var camera = Common.camera;
                this.addScore(enemy.value * (Common.playerMorphLevel + 1), new PIXI.Point(enemy.x - camera.position.x, enemy.y - camera.position.y), !0)
            }, GameScene.prototype.onPowerupCollect = function(powerup, owner) {
                var config, emitter, camera = Common.camera;
                if (!this._player.dead) {
                    switch (powerup.type) {
                        case PowerupTypes.ALIEN_UPGRADE:
                            var morphs = Common.playerMorphs,
                                level = Common.playerMorphLevel,
                                step = Common.playerMorphStepLevel,
                                value = 1e3;
                            if (Common.playerMorphLevel < morphs.length - 1) {
                                value = 50;
                                var steps = morphs[level].steps;
                                if (step < steps) ++Common.playerMorphStepLevel;
                                else {
                                    ++Common.playerMorphLevel, Common.playerMorphStepLevel = 0;
                                    var animate = !1;
                                    Common.playerMorphLevel > 1 ? animate = !0 : level > 1 && (animate = !0), this.morphPlayer(Common.playerMorphLevel, animate)
                                }
                                this._hud.alienBar.upgrade(!0)
                            }
                            this.addScore(value, new PIXI.Point(powerup.x - camera.position.x, powerup.y - camera.position.y), !0), config = Common.assets.getJSON("particle_emitter_pickup_transform_00"), emitter = new cloudkid.Emitter(powerup.parent, [Common.assets.getTexture("particle_transform_pickup_00")], config), emitter.emit = !0, emitter.updateOwnerPos(powerup.x, powerup.y), Common.animator.add(emitter);
                            break;
                        case PowerupTypes.BOMB:
                            var type = BombTypes.MISSILE;
                            if (Common.currentLevel % 2) switch (Common.playerMorphLevel) {
                                case 0:
                                    type = BombTypes.MISSILE;
                                    break;
                                case 1:
                                    type = BombTypes.SHOCKWAVE;
                                    break;
                                case 2:
                                    type = BombTypes.GOO_RADIAL;
                                    break;
                                case 3:
                                    type = BombTypes.GOO_SPLAT;
                                    break;
                                case 4:
                                    type = BombTypes.GOO_SPLAT
                            } else switch (Common.playerMorphLevel) {
                                case 0:
                                    type = BombTypes.MISSILE;
                                    break;
                                case 1:
                                    type = BombTypes.SHOCKWAVE;
                                    break;
                                case 2:
                                    type = BombTypes.HEATBLAST_WAVE1;
                                    break;
                                case 3:
                                    type = BombTypes.HEATBLAST_WAVE1;
                                    break;
                                case 4:
                                    type = BombTypes.HEATBLAST_WAVE1
                            }
                            this.activateBomb(type, owner, new PIXI.Point(owner.x, owner.y)), this.addScore(50, new PIXI.Point(powerup.x - camera.position.x, powerup.y - camera.position.y), !0), config = Common.assets.getJSON("particle_emitter_pickup_hexshield_00"), emitter = new cloudkid.Emitter(powerup.parent, [Common.assets.getTexture("particle_powerup_pickup_00")], config), emitter.emit = !0, emitter.updateOwnerPos(powerup.x, powerup.y), Common.animator.add(emitter)
                    }
                    Common.audio.playSound("sfx_omnitrix_open_00")
                }
            }, GameScene.prototype.onBossFireLaser = function(boss, start, rotation) {
                rotation = rotation || 0;
                for (var precision = .1, inv = 1 / precision, steps = Math.floor(p3.View.width * precision), p = new PIXI.Point(start.x, start.y), target = this._player, i = 0; i < steps; ++i) {
                    if (p.x > target.x + target.aabb.x && p.x < target.x + target.aabb.x + target.aabb.width && p.y > target.y + target.aabb.y && p.y < target.y + target.aabb.y + target.aabb.height) {
                        var config = Common.assets.getJSON("particle_emitter_player_hit_00"),
                            emitter = new cloudkid.Emitter(target.parent, [Common.assets.getTexture("particle_player_hit_001")], config);
                        emitter.emit = !0, emitter.updateOwnerPos(p.x, p.y), Common.animator.add(emitter), !this._player.invulnerable && this.explodePlayer();
                        break
                    }
                    p.x += Math.cos(rotation) * inv, p.y += Math.sin(rotation) * inv
                }
            }, GameScene.prototype.onBossCallHelp = function(boss) {
                var group = new SpawnerGroup;
                group.position.x = boss.x + p3.View.width, group.position.y = 0, group.powerup = 0;
                var creepa = new SpawnerCreep(group);
                creepa.type = 0, creepa.position.x = group.position.x + 800, creepa.position.y = 80, creepa.delay = 0, creepa.path = "basic", group.creeps.push(creepa);
                var creepb = new SpawnerCreep(group);
                creepb.type = 0, creepb.position.x = group.position.x + 1400, creepb.position.y = 440, creepb.delay = 2, creepb.path = "basic", group.creeps.push(creepb);
                var creepc = new SpawnerCreep(group);
                creepc.type = 0, creepc.position.x = group.position.x + 1600, creepc.position.y = 220, creepc.delay = 1, creepc.path = "basic", group.creeps.push(creepc), this._spawner.addGroup(group)
            }, GameScene.prototype.onBossTakeDamage = function(boss, damage) {
                var value = damage / this._totalBossHealth;
                this._hud.bossTakeDamage(value, !0);
                var radius = 120 * Math.random(),
                    angle = Math.random() * (2 * Math.PI),
                    position = new PIXI.Point(Math.cos(angle) * radius + 60, Math.sin(angle) * radius - 80),
                    config = Common.assets.getJSON("particle_emitter_boss_hit_00");
                config.maxParticles = p3.Device.isMobile ? .6 * config.maxParticles : config.maxParticles;
                var emitter = new cloudkid.Emitter(boss.parent, [Common.assets.getTexture("particle_player_hit_001")], config);
                emitter.emit = !0, emitter.updateOwnerPos(boss.x + position.x, boss.y + position.y), Common.animator.add(emitter)
            }, GameScene.prototype.onPauseButtonClick = function() {
                this.signals.pause.dispatch(this, !0)
            }, GameScene.prototype.onJoystickInput = function(joystick, axis) {
                p3.Device.isMobile && (1 == axis.x ? (Common.input.isKeyLeft = !1, Common.input.isKeyRight = !0) : axis.x == -1 ? (Common.input.isKeyLeft = !0, Common.input.isKeyRight = !1) : (Common.input.isKeyLeft = !1, Common.input.isKeyRight = !1), 1 == axis.y ? (Common.input.isKeyUp = !1, Common.input.isKeyDown = !0) : axis.y == -1 ? (Common.input.isKeyUp = !0, Common.input.isKeyDown = !1) : (Common.input.isKeyUp = !1, Common.input.isKeyDown = !1))
            }, GameScene.prototype.onFireButton = function(button, value) {
                Common.input.isKeyFire = value
            }
        }, {
            "./AI": 1,
            "./AIPath": 2,
            "./AITypes": 4,
            "./AudioParams": 9,
            "./Ben1": 10,
            "./Ben2": 11,
            "./BombTypes": 15,
            "./BossState1": 17,
            "./BossState2": 18,
            "./BossState3": 19,
            "./BossState4": 20,
            "./BossState5": 21,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25,
            "./DroneLarge": 28,
            "./DroneLargeFly": 29,
            "./DroneLargeFlyShoot": 30,
            "./DroneLargeShoot": 31,
            "./DroneLargeSpinner": 32,
            "./DroneSmall": 33,
            "./DroneSmallFly": 34,
            "./DroneSmallFlyShoot": 35,
            "./DroneSmallShoot": 36,
            "./DroneSmallSpinner": 37,
            "./GooRadialBomb": 39,
            "./GooSplatBomb": 40,
            "./Heatblast1": 41,
            "./Heatblast2": 42,
            "./Heatblast3": 43,
            "./HeatwaveBomb": 44,
            "./Hud": 46,
            "./Missile": 51,
            "./MissileBomb": 52,
            "./Player": 54,
            "./Powerup": 55,
            "./PowerupTypes": 56,
            "./PreloaderScene": 57,
            "./ShockwaveBomb": 60,
            "./Spawner": 61,
            "./SpawnerCreep": 62,
            "./SpawnerGroup": 63,
            "./Stinkfly1": 65,
            "./Stinkfly2": 66,
            "./Stinkfly3": 67,
            "./TransformationEffect": 69,
            "./World": 70
        }],
        39: [function(require, module, exports) {
            "use strict";

            function GooRadialBomb(owner) {
                Bomb.call(this, owner)
            }
            var Bomb = require("./Bomb"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = GooRadialBomb, GooRadialBomb.prototype = Object.create(Bomb.prototype), GooRadialBomb.prototype.constructor = GooRadialBomb, GooRadialBomb.prototype.activate = function(position, count) {
                for (var bullet, angle, direction, spacing = 2 * Math.PI / count, i = 0; i < count; ++i) angle = spacing * i - .5 * Math.PI, direction = new p3.Vector2(Math.cos(angle), Math.sin(angle)), bullet = Bullet.create(BulletTypes.GOO_BALL3, this.owner, direction), bullet.x = position.x, bullet.y = position.y, this.signals.fire.dispatch(bullet);
                Common.audio.playSound("sfx_stinkfly_gasattack_00"), Bomb.prototype.activate.call(this)
            }
        }, {
            "./Bomb": 14,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        40: [function(require, module, exports) {
            "use strict";

            function GooSplatBomb(owner) {
                Bomb.call(this, owner)
            }
            var Bomb = require("./Bomb"),
                Common = require("./Common");
            module.exports = GooSplatBomb, GooSplatBomb.prototype = Object.create(Bomb.prototype), GooSplatBomb.prototype.constructor = GooSplatBomb, GooSplatBomb.prototype.activate = function(parent, targets) {
                for (var splat, angle, radius, textures = ["projectile_bomb_stinkfly_001", "projectile_bomb_stinkfly_002", "projectile_bomb_stinkfly_003"], positions = [{
                        x: 379,
                        y: 813
                    }, {
                        x: 296,
                        y: 602
                    }, {
                        x: 388,
                        y: 265
                    }, {
                        x: 500,
                        y: 210
                    }, {
                        x: 816,
                        y: 546
                    }, {
                        x: 173,
                        y: 331
                    }, {
                        x: 1133,
                        y: 198
                    }], i = 0; i < positions.length; ++i) splat = new PIXI.Sprite(Common.assets.getTexture(textures[Math.floor(Math.random() * textures.length)])), angle = Math.random() * (2 * Math.PI), radius = 220 + 500 * Math.random(), splat.x = positions[i].x, splat.y = positions[i].y, splat.rotation = .8 * Math.random() + -.4, splat.anchor = new PIXI.Point(.5, .5), parent.addChild(splat), splat.scale = new PIXI.Point, TweenMax.to(splat.scale, .32, {
                    delay: .1 * Math.random(),
                    x: 1,
                    y: 1,
                    ease: Power2.easeOut
                }), TweenMax.to(splat, .24, {
                    delay: .6,
                    alpha: 0,
                    ease: Power1.easeInOut,
                    onComplete: function(splat) {
                        splat.parent.removeChild(splat)
                    },
                    onCompleteParams: [splat],
                    onCompleteScope: this
                });
                var target;
                for (i = 0; i < targets.length; ++i) target = targets[i], target.takeDamage(Number.MAX_VALUE);
                Common.audio.playSound("sfx_stinkfly_gloophit_00"), Bomb.prototype.activate.call(this)
            }
        }, {
            "./Bomb": 14,
            "./Common": 25
        }],
        41: [function(require, module, exports) {
            "use strict";

            function Heatblast1() {
                Player.call(this), this.speed = 2740;
                var holder = new PIXI.Container;
                holder.x = 6, holder.y = 60, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("heatblast")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine);
                var sequence = new p3.MovieClipSequence;
                sequence.addTextures([Common.assets.getTexture("heatblast_flame_001"), Common.assets.getTexture("heatblast_flame_002"), Common.assets.getTexture("heatblast_flame_003")]), this._flames = new p3.MovieClip(sequence), this._flames.x = -94, this._flames.y = -20, this._flames.anchor = new PIXI.Point(.5, .5), holder.addChild(this._flames), this.fireOffset = new PIXI.Point(24, (-44)), this.aabb = new PIXI.Rectangle((-72), (-96), 144, 144), this._loopSFX = null
            }
            var AudioParams = (require("./Actor"), require("./AudioParams")),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Player = require("./Player");
            module.exports = Heatblast1, Heatblast1.prototype = Object.create(Player.prototype), Heatblast1.prototype.constructor = Heatblast1, Heatblast1.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_001", !0), this._flames.animationSpeed = 12, this._flames.looping = !0, this._flames.play(), Common.audio.playSound("sfx_heatblast_appear_00");
                var params = new AudioParams;
                params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_heatblast_fly_loop_00", "sfx_heatblast_fly_loop_01"], params);
                var config = Common.assets.getJSON("particle_emitter_heatblast_platform_00");
                config.maxParticles = p3.Device.isMobile ? .2 * config.maxParticles : config.maxParticles, this._emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_heatblast_flame_00"), Common.assets.getTexture("particle_heatblast_flame_01")], config), this._emitter.emit = !0
            }, Heatblast1.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), this._emitter && (this._emitter.destroy(), this._emitter = null), Player.prototype.destroy.call(this)
            }, Heatblast1.prototype.update = function() {
                Player.prototype.update.call(this), this._emitter.updateOwnerPos(this.x - 28, this.y + 66), this._emitter.update(p3.Timestep.deltaTime), this.spine.update(p3.Timestep.deltaTime)
            }, Heatblast1.prototype.fire = function() {
                this._fireTime = this.fireRate;
                var type = BulletTypes.FIRE_BALL1,
                    position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y),
                    rotation = 0,
                    direction = new p3.Vector2(1, 0);
                this.signals.fire.dispatch(type, this, position, rotation, direction, !1), Common.audio.playSound(["sfx_heatblast_shoot_flame_04_00", "sfx_heatblast_shoot_flame_04_01", "sfx_heatblast_shoot_flame_04_02", "sfx_heatblast_shoot_flame_04_03"])
            }
        }, {
            "./Actor": 5,
            "./AudioParams": 9,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54
        }],
        42: [function(require, module, exports) {
            "use strict";

            function Heatblast2() {
                Player.call(this), this.speed = 2800;
                var holder = new PIXI.Container;
                holder.x = 6, holder.y = 60, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("heatblast")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine);
                var sequence = new p3.MovieClipSequence;
                sequence.addTextures([Common.assets.getTexture("heatblast_flame_001"), Common.assets.getTexture("heatblast_flame_002"), Common.assets.getTexture("heatblast_flame_003")]), this._flames = new p3.MovieClip(sequence), this._flames.x = -94, this._flames.y = -20, this._flames.anchor = new PIXI.Point(.5, .5), holder.addChild(this._flames), this.fireOffset = new PIXI.Point(46, (-34)), this.aabb = new PIXI.Rectangle((-72), (-96), 144, 144), this._loopSFX = null
            }
            var AudioParams = (require("./Actor"), require("./AudioParams")),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Player = require("./Player");
            require("./TrailRenderer");
            module.exports = Heatblast2, Heatblast2.prototype = Object.create(Player.prototype), Heatblast2.prototype.constructor = Heatblast2, Heatblast2.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_002", !0), this._flames.animationSpeed = 12, this._flames.looping = !0, this._flames.play(), Common.audio.playSound("sfx_heatblast_appear_00");
                var params = new AudioParams;
                params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_heatblast_fly_loop_00", "sfx_heatblast_fly_loop_01"], params);
                var config = Common.assets.getJSON("particle_emitter_heatblast_platform_00");
                config.maxParticles = p3.Device.isMobile ? .2 * config.maxParticles : config.maxParticles, this._emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_heatblast_flame_00"), Common.assets.getTexture("particle_heatblast_flame_01")], config), this._emitter.emit = !0
            }, Heatblast2.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), this._emitter && (this._emitter.destroy(), this._emitter = null), Player.prototype.destroy.call(this)
            }, Heatblast2.prototype.update = function() {
                Player.prototype.update.call(this), this._emitter.updateOwnerPos(this.x - 28, this.y + 66), this._emitter.update(p3.Timestep.deltaTime), this.spine.update(p3.Timestep.deltaTime)
            }, Heatblast2.prototype.fire = function() {
                this._fireTime = this.fireRate;
                var type = BulletTypes.FIRE_BALL2,
                    position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y),
                    rotation = 0,
                    direction = new p3.Vector2(1, 0);
                this.signals.fire.dispatch(type, this, position, rotation, direction, !1), Common.audio.playSound(["sfx_heatblast_shoot_flame_04_00", "sfx_heatblast_shoot_flame_04_01", "sfx_heatblast_shoot_flame_04_02", "sfx_heatblast_shoot_flame_04_03"])
            }
        }, {
            "./Actor": 5,
            "./AudioParams": 9,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54,
            "./TrailRenderer": 68
        }],
        43: [function(require, module, exports) {
            "use strict";

            function Heatblast3() {
                Player.call(this), this.speed = 2860;
                var holder = new PIXI.Container;
                holder.x = 6, holder.y = 60, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("heatblast")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine);
                var sequence = new p3.MovieClipSequence;
                sequence.addTextures([Common.assets.getTexture("heatblast_flame_001"), Common.assets.getTexture("heatblast_flame_002"), Common.assets.getTexture("heatblast_flame_003")]), this.fireRate = .3, this.fireOffset = new PIXI.Point(46, (-24)), this.aabb = new PIXI.Rectangle((-72), (-96), 144, 144), this._flames = new p3.MovieClip(sequence), this._flames.x = -94, this._flames.y = -20, this._flames.anchor = new PIXI.Point(.5, .5), holder.addChild(this._flames), this._altFire = !1, this._loopSFX = null
            }
            var AudioParams = (require("./Actor"), require("./AudioParams")),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Player = require("./Player");
            require("./TrailRenderer");
            module.exports = Heatblast3, Heatblast3.prototype = Object.create(Player.prototype), Heatblast3.prototype.constructor = Heatblast3, Heatblast3.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_003", !0), this._flames.animationSpeed = 12, this._flames.looping = !0, this._flames.play(), Common.audio.playSound("sfx_heatblast_appear_00");
                var params = new AudioParams;
                params.loop = !0, this._loopSFX = Common.audio.playSound(["sfx_heatblast_fly_loop_00", "sfx_heatblast_fly_loop_01"], params);
                var config = Common.assets.getJSON("particle_emitter_heatblast_platform_00");
                config.maxParticles = p3.Device.isMobile ? .2 * config.maxParticles : config.maxParticles, this._emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_heatblast_flame_00"), Common.assets.getTexture("particle_heatblast_flame_01")], config), this._emitter.emit = !0
            }, Heatblast3.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), this._emitter && (this._emitter.destroy(), this._emitter = null), Player.prototype.destroy.call(this)
            }, Heatblast3.prototype.update = function() {
                Player.prototype.update.call(this), this._emitter.updateOwnerPos(this.x - 28, this.y + 66), this._emitter.update(p3.Timestep.deltaTime), this.spine.update(p3.Timestep.deltaTime)
            }, Heatblast3.prototype.fire = function() {
                this._fireTime = this.fireRate;
                var type = BulletTypes.FIRE_BALL3,
                    position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y),
                    rotation = this._altFire ? 0 : .4,
                    direction = new p3.Vector2(Math.cos(rotation), Math.sin(rotation));
                this.signals.fire.dispatch(type, this, position, rotation, direction, !1), this._altFire = !this._altFire, Common.audio.playSound(["sfx_heatblast_shoot_flame_04_00", "sfx_heatblast_shoot_flame_04_01", "sfx_heatblast_shoot_flame_04_02", "sfx_heatblast_shoot_flame_04_03"])
            }
        }, {
            "./Actor": 5,
            "./AudioParams": 9,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54,
            "./TrailRenderer": 68
        }],
        44: [function(require, module, exports) {
            "use strict";

            function HeatwaveBomb(owner) {
                Bomb.call(this, owner)
            }
            var Bomb = require("./Bomb"),
                Common = require("./Common"),
                Bullet = require("./Bullet"),
                BulletTypes = require("./BulletTypes");
            module.exports = HeatwaveBomb, HeatwaveBomb.prototype = Object.create(Bomb.prototype), HeatwaveBomb.prototype.constructor = HeatwaveBomb, HeatwaveBomb.prototype.activate = function(type, position) {
                type = type || BulletTypes.HEATBLAST_WAVE1;
                var left = Bullet.create(type, this.owner, new p3.Vector2((-1), 0));
                left.x = position.x, left.y = position.y, this.signals.fire.dispatch(left);
                var right = Bullet.create(type, this.owner, new p3.Vector2(1, 0));
                right.x = position.x, right.y = position.y, this.signals.fire.dispatch(right), Common.audio.playSound("sfx_heatblast_shoot_big_02"), Bomb.prototype.activate.call(this)
            }
        }, {
            "./Bomb": 14,
            "./Bullet": 22,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        45: [function(require, module, exports) {
            "use strict";

            function HelpScene(paused) {
                this._paused = paused, this._titleLabel = null, this._image = null, this._images = [], this._imageIndex = 0, this._page = null, this._pages = [], this._nextButton = null, this._previousButton = null, this._closeButton = null, this._soundButton = null, p3.Scene.call(this)
            }
            var BenButton = require("./BenButton"),
                BenMuteButton = require("./BenMuteButton"),
                Common = require("./Common"),
                Input = require("./Input");
            module.exports = HelpScene, HelpScene.prototype = Object.create(p3.Scene.prototype), HelpScene.prototype.constructor = HelpScene, HelpScene.prototype.init = function() {
                var bg = new PIXI.Sprite(Common.assets.getTexture("paused_bg"));
                this.addChild(bg);
                var str = this._paused ? Common.copy.paused[Common.language] : Common.copy.instructions[Common.language];
                "ar" != Common.language && "ru" != Common.language ? (this._titleLabel = new PIXI.extras.BitmapText(str, {
                    font: "75px Ahkio Paused",
                    align: "center"
                }), this._titleLabel.x = .5 * (Common.STAGE_WIDTH - this._titleLabel.textWidth), this._titleLabel.y = 120 - .5 * this._titleLabel.textHeight, this.addChild(this._titleLabel)) : (this._titleLabel = new PIXI.Text(str, {
                    font: "75px Arial",
                    fill: "#FFFFFF",
                    stroke: "#000000",
                    strokeThickness: 10,
                    align: "center"
                }), this._titleLabel.x = .5 * (Common.STAGE_WIDTH - this._titleLabel.width), this._titleLabel.y = 120 - .5 * this._titleLabel.height, this.addChild(this._titleLabel)), this._images = [p3.Device.isMobile ? Common.assets.getTexture("tutorial_mobile_001") : Common.assets.getTexture("tutorial_desktop_001"), p3.Device.isMobile ? Common.assets.getTexture("tutorial_mobile_002") : Common.assets.getTexture("tutorial_desktop_002"), p3.Device.isMobile ? Common.assets.getTexture("tutorial_mobile_003") : Common.assets.getTexture("tutorial_desktop_003")], this._image = new PIXI.Sprite(this._images[this._imageIndex]), this._image.x = .5 * Common.STAGE_WIDTH, this._image.y = 346, this._image.anchor = new PIXI.Point(.5, .5), this.addChild(this._image), this._pages = [Common.assets.getTexture("page_counter_001"), Common.assets.getTexture("page_counter_002"), Common.assets.getTexture("page_counter_003")], this._page = new PIXI.Sprite(this._pages[this._imageIndex]), this._page.x = .5 * Common.STAGE_WIDTH, this._page.y = 514, this._page.anchor = new PIXI.Point(.5, .5), this.addChild(this._page);
                var states = new p3.ButtonStates;
                states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_home_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_home_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._homeButton = new BenButton(states), this._homeButton.y = 80, this._homeButton.animate = !0, this._homeButton.overSoundName = "sfx_btn_rollover_00", this._homeButton.clickSoundName = "sfx_btn_press_00", this._homeButton.signals.click.add(this.onHomeButtonClick, this), this.addChild(this._homeButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_audio_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_audio_over"), states.iconAlt = Common.assets.getTexture("btn_tertuary_icon_mute_off"), states.iconOverAlt = Common.assets.getTexture("btn_tertuary_icon_mute_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._soundButton = new BenMuteButton(states), this._soundButton.y = 80, this._soundButton.animate = !0, this._soundButton.overSoundName = "sfx_btn_rollover_00", this._soundButton.clickSoundName = "sfx_btn_press_00", this.addChild(this._soundButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_next_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_next_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._nextButton = new BenButton(states), this._nextButton.x = .5 * Common.STAGE_WIDTH + 434, this._nextButton.y = 360, this._nextButton.animate = !0, this._nextButton.overSoundName = "sfx_btn_rollover_00", this._nextButton.clickSoundName = "sfx_menu_swipe_00", this._nextButton.signals.click.add(this.onNextButtonClick, this), this.addChild(this._nextButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_back_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_back_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._previousButton = new BenButton(states), this._previousButton.x = .5 * Common.STAGE_WIDTH - 434, this._previousButton.y = 360, this._previousButton.animate = !0, this._previousButton.overSoundName = "sfx_btn_rollover_00", this._previousButton.clickSoundName = "sfx_menu_swipe_00", this._previousButton.signals.click.add(this.onPreviousButtonClick, this), this.addChild(this._previousButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_primary_large_off"), states.over = Common.assets.getTexture("btn_primary_large_over"), states.icon = Common.assets.getTexture("btn_primary_large_icon_play_off"), states.iconOver = Common.assets.getTexture("btn_primary_large_icon_play_over"), states.innerRing = Common.assets.getTexture("btn_primary_large_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_primary_large_off_ring_001"), this._closeButton = new BenButton(states), this._closeButton.y = p3.View.height - 100, this._closeButton.animate = !0, this._closeButton.overSoundName = "sfx_btn_rollover_00", this._closeButton.clickSoundName = "sfx_btn_play_00", this._closeButton.signals.click.add(this.onCloseButtonClick, this), this.addChild(this._closeButton), p3.Scene.prototype.init.call(this)
            }, HelpScene.prototype.destroy = function() {
                Common.input.signals.keyUp.remove(this.onKeyUp, this), this._homeButton.destroy(), this._soundButton.destroy(), this._nextButton.destroy(), this._previousButton.destroy(), this._closeButton.destroy(), p3.Scene.prototype.destroy.call(this)
            }, HelpScene.prototype.resize = function() {
                this.x = .5 * (p3.View.width - Common.STAGE_WIDTH), this._homeButton.x = .5 * (Common.STAGE_WIDTH - p3.View.width) + 80, this._soundButton.x = .5 * (Common.STAGE_WIDTH + p3.View.width) - 80, this._closeButton.x = .5 * (Common.STAGE_WIDTH + p3.View.width) - 100
            }, HelpScene.prototype.appear = function() {
                p3.Scene.prototype.appear.call(this), Common.input.signals.keyUp.add(this.onKeyUp, this)
            }, HelpScene.prototype.update = function() {}, HelpScene.prototype.nextImage = function() {
                ++this._imageIndex >= this._images.length && (this._imageIndex = 0), this._image.texture = this._images[this._imageIndex], this._page.texture = this._pages[this._imageIndex]
            }, HelpScene.prototype.previousImage = function() {
                --this._imageIndex < 0 && (this._imageIndex = this._images.length - 1), this._image.texture = this._images[this._imageIndex], this._page.texture = this._pages[this._imageIndex]
            }, HelpScene.prototype.onHomeButtonClick = function(button) {
                this.signals.home.dispatch(this)
            }, HelpScene.prototype.onNextButtonClick = function(button) {
                this.nextImage()
            }, HelpScene.prototype.onPreviousButtonClick = function(button) {
                this.previousImage()
            }, HelpScene.prototype.onCloseButtonClick = function(button) {
                this.signals.next.dispatch(this)
            }, HelpScene.prototype.onKeyUp = function(event) {
                event.keyCode == Input.keys.ENTER && (this._imageIndex == this._images.length - 1 ? this.onCloseButtonClick(null) : this.onNextButtonClick(null))
            }
        }, {
            "./BenButton": 12,
            "./BenMuteButton": 13,
            "./Common": 25,
            "./Input": 47
        }],
        46: [function(require, module, exports) {
            "use strict";

            function Hud() {
                PIXI.Container.call(this), this.signals = {}, this.signals.pause = new signals.Signal, this.signals.fire = new signals.Signal, this._score = new PIXI.Sprite(Common.assets.getTexture("game_ui_score")), this._score.y = 60, this._score.anchor = new PIXI.Point(.5, .5), this.addChild(this._score), this._score.label = new PIXI.extras.BitmapText("0", {
                    font: "26px Ahkio Game",
                    align: "left"
                }), this._score.label.x = .5 * -this._score.label.textWidth + 20, this._score.label.y = .5 * -this._score.label.textHeight + 2, this._score.label.value = 0, this._score.addChild(this._score.label), this._scoreSmooth = this._score.label.value, this.updateScoreText(this._scoreSmooth), this._alienBar = new AlienBar, this._alienBar.y = 46, this._alienBar.upgrade(!1), this.addChild(this._alienBar), this._joystick = new Joystick, this._joystick.y = p3.View.height - 140, this._joystick.visible = p3.Device.isMobile, this.addChild(this._joystick);
                var states = new p3.ButtonStates;
                states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_pause_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_pause_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._pauseButton = new BenButton(states), this._pauseButton.y = 80, this._pauseButton.animate = !0, this._pauseButton.overSoundName = "sfx_btn_rollover_00", this._pauseButton.clickSoundName = "sfx_btn_press_00", this._pauseButton.signals.click.add(this.onPauseButtonClick, this), this.addChild(this._pauseButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_shoot"), this._fireButton = new p3.Button(states), this._fireButton.y = p3.View.height - 140, this._fireButton.visible = !1, this._fireButton.signals.down.add(this.onFireButtonDown, this), this._fireButton.signals.up.add(this.onFireButtonUp, this), this.addChild(this._fireButton), this._bossHealthSmooth = 0, this._bossHealth = new PIXI.Container, this._bossHealth.x = .5 * p3.View.width, this._bossHealth.y = .5 * Common.STAGE_HEIGHT - 212, this._bossHealth.visible = !1, this._bossHealth.hitArea = new PIXI.Rectangle, this.addChild(this._bossHealth), this._bossHealth.panel = new PIXI.Sprite(Common.assets.getTexture("boss_health_back")), this._bossHealth.panel.anchor = new PIXI.Point(.5, .5), this._bossHealth.addChild(this._bossHealth.panel), this._bossHealth.bar = new PIXI.Sprite(Common.assets.getTexture("boss_health_fill")), this._bossHealth.bar.x = .5 * -this._bossHealth.bar.texture.width, this._bossHealth.bar.anchor = new PIXI.Point(0, .5), this._bossHealth.addChild(this._bossHealth.bar), this._bossHealth.bar.mask = new PIXI.Graphics, this._bossHealth.bar.mask.beginFill(16776960), this._bossHealth.bar.mask.drawRect(0, .5 * -this._bossHealth.bar.texture.height, this._bossHealth.bar.texture.width, this._bossHealth.bar.texture.height), this._bossHealth.bar.mask.endFill(), this._bossHealth.bar.addChild(this._bossHealth.bar.mask);
                var sequence = new p3.MovieClipSequence;
                sequence.addTextures([Common.assets.getTexture("boss_health_icon_001"), Common.assets.getTexture("boss_health_icon_002"), Common.assets.getTexture("boss_health_icon_001")]), this._bossHealth.avatar = new p3.MovieClip(sequence), this._bossHealth.avatar.x = -142, this._bossHealth.avatar.y = -28, this._bossHealth.avatar.animationSpeed = 4, this._bossHealth.avatar.anchor = new PIXI.Point(.5, .5), this._bossHealth.addChild(this._bossHealth.avatar)
            }
            var AlienBar = require("./AlienBar"),
                BenButton = require("./BenButton"),
                Common = require("./Common"),
                Joystick = (require("./DistortionEffect"), require("./Joystick"));
            module.exports = Hud, Hud.prototype = Object.create(PIXI.Container.prototype), Hud.prototype.constructor = Hud, Hud.prototype.destroy = function() {
                this._joystick.destroy(), PIXI.Container.prototype.destroy.call(this)
            }, Hud.prototype.resize = function() {
                this._score.x = .5 * this._score.width + 18, this._pauseButton.x = p3.View.width - 80, this._alienBar.x = .5 * p3.View.width, this._joystick.x = 140, this._joystick.resize(), this._fireButton.x = p3.View.width - 140
            }, Hud.prototype.update = function() {
                this._scoreSmooth += .42 * (this._score.label.value - this._scoreSmooth), this.updateScoreText(this._scoreSmooth), this._bossHealth.bar.mask.scale.x += .42 * (this._bossHealthSmooth - this._bossHealth.bar.mask.scale.x), this._alienBar.update(), this._joystick.update()
            }, Hud.prototype.showLevelBanner = function() {
                var banner = new PIXI.Sprite(Common.assets.getTexture("level_panel"));
                banner.x = .5 * p3.View.width, banner.y = 340, banner.anchor = new PIXI.Point(.5, .5), banner.visible = !1, this.addChild(banner), "ar" != Common.language && "ru" != Common.language ? (banner.label = new PIXI.extras.BitmapText(Common.copy.level[Common.language].replace("[LEVEL]", Common.currentLevel + 1), {
                    font: "100px Ahkio Green",
                    align: "center"
                }), banner.label.x = .5 * -banner.label.textWidth, banner.label.y = .5 * -banner.label.textHeight, banner.addChild(banner.label)) : (banner.label = new PIXI.Text(Common.copy.level[Common.language].replace("[LEVEL]", Common.currentLevel + 1), {
                    font: "100px Arial",
                    fill: "#69FF00",
                    stroke: "#044300",
                    strokeThickness: 10,
                    align: "center"
                }), banner.label.x = .5 * -banner.label.width, banner.label.y = .5 * -banner.label.height, banner.addChild(banner.label));
                var tl = new TimelineMax;
                banner.scale = new PIXI.Point, tl.append(TweenMax.to(banner.scale, .34, {
                    delay: .6,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2],
                    onStart: function() {
                        banner.visible = !0, banner.scale = new PIXI.Point(.5, .5)
                    }
                })), tl.append(TweenMax.to(banner, .2, {
                    delay: 1.4,
                    alpha: 0,
                    ease: Power1.easeOut,
                    onComplete: function() {
                        banner.parent.removeChild(banner), banner.destroy()
                    },
                    onCompleteScope: this
                })), Common.animator.add(tl)
            }, Hud.prototype.addScorePopup = function(position, value, multiplier) {
                var holder = new PIXI.Container;
                holder.x = position.x, holder.y = position.y, holder.hitArea = new PIXI.Rectangle, this.addChild(holder);
                var text = new PIXI.extras.BitmapText("+" + value.toString(), {
                    font: "38px Ahkio Orange",
                    align: "center"
                });
                text.x = .5 * -text.textWidth, text.y = .5 * -text.textHeight, holder.addChild(text);
                var tl = Common.animator.add(new TimelineMax({
                    onComplete: function(text) {
                        text.parent && text.parent.removeChild(text), text.destroy()
                    },
                    onCompleteParams: [holder],
                    onCompleteScope: this
                }));
                multiplier ? (holder.scale = new PIXI.Point, tl.insert(TweenMax.to(holder.scale, .4, {
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [6]
                })), tl.insert(TweenMax.to(holder, .2, {
                    delay: .4,
                    alpha: 0,
                    ease: Power1.easeInOut
                }))) : (holder.alpha = 0, tl.insert(TweenMax.to(holder, .2, {
                    alpha: 1,
                    ease: Power1.easeInOut
                })), tl.insert(TweenMax.to(holder, .6, {
                    y: holder.y - 60,
                    ease: Power1.easeIn
                })), tl.insert(TweenMax.to(holder, .2, {
                    delay: .4,
                    alpha: 0,
                    ease: Power1.easeInOut
                })))
            }, Hud.prototype.updateScoreText = function(value) {
                this._score.label.text = Math.round(value).toString(), this._score.label.validate(), this._score.label.x = .5 * -this._score.label.textWidth + 20, this._score.label.y = .5 * -this._score.label.textHeight + 2
            }, Hud.prototype.showBossHealth = function() {
                this._bossHealth.visible || (this._bossHealthSmooth = 1, this._bossHealth.scale = new PIXI.Point, this._bossHealth.visible = !0, TweenMax.to(this._bossHealth.scale, .4, {
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2]
                }))
            }, Hud.prototype.bossTakeDamage = function(value, animate) {
                this._bossHealthSmooth = Math.max(0, this._bossHealthSmooth - value), animate && this._bossHealth.avatar.gotoAndPlay(0)
            }, Hud.prototype.onPauseButtonClick = function(button) {
                this.signals.pause.dispatch(this)
            }, Hud.prototype.onFireButtonDown = function(button) {
                this.signals.fire.dispatch(this, !0)
            }, Hud.prototype.onFireButtonUp = function(button) {
                this.signals.fire.dispatch(this, !1)
            }, Object.defineProperty(Hud.prototype, "score", {
                get: function() {
                    return this._score.value
                },
                set: function(value) {
                    this._score.label.value = value
                }
            }), Object.defineProperty(Hud.prototype, "alienBar", {
                get: function() {
                    return this._alienBar
                }
            }), Object.defineProperty(Hud.prototype, "joystick", {
                get: function() {
                    return this._joystick
                }
            })
        }, {
            "./AlienBar": 6,
            "./BenButton": 12,
            "./Common": 25,
            "./DistortionEffect": 27,
            "./Joystick": 49
        }],
        47: [function(require, module, exports) {
            "use strict";

            function Input() {
                this.isKeyUp = !1, this.isKeyLeft = !1, this.isKeyRight = !1, this.isKeyDown = !1, this.isKeyFire = !1, this.isKeyAltFire = !1, this.touch = new PIXI.Point, this.isTouch = !1, this.signals = {}, this.signals.mouseMove = new signals.Signal, this.signals.mouseDown = new signals.Signal, this.signals.mouseUp = new signals.Signal, this.signals.mouseClick = new signals.Signal, this.signals.keyDown = new signals.Signal, this.signals.keyUp = new signals.Signal, this._stage = null
            }
            module.exports = Input, Input.keys = {}, Input.keys.W = 87, Input.keys.A = 65, Input.keys.S = 83, Input.keys.D = 68, Input.keys.Z = 90, Input.keys.X = 88, Input.keys.C = 67, Input.keys.SPACE = 32, Input.keys.LEFT = 37, Input.keys.RIGHT = 39, Input.keys.UP = 38, Input.keys.DOWN = 40, Input.keys.ENTER = 13, Input.prototype.init = function(stage, keyListener) {
                this._stage = stage, this._stage.interactive = !0, this._stage.mousemove = this._stage.touchmove = this.onMouseMove.bind(this), this._stage.mousedown = this._stage.touchstart = this.onMouseDown.bind(this), this._stage.mouseup = this._stage.touchend = this.onMouseUp.bind(this), this._stage.click = this._stage.tap = this.onMouseClick.bind(this), keyListener.onkeydown = this.onKeyDown.bind(this), keyListener.onkeyup = this.onKeyUp.bind(this), setInterval(function() {
                    keyListener.focus()
                }, 1e3)
            }, Input.prototype.dispose = function() {
                this._stage.mousemove = this._stage.touchmove = null, this._stage.mousedown = this._stage.touchstart = null, this._stage.mouseup = this._stage.touchend = null, this._stage.click = this._stage.tap = null, this.signals.mouseMove.dispose(), this.signals.mouseDown.dispose(), this.signals.mouseUp.dispose(), this.signals.mouseClick.dispose(), this.signals.keyDown.dispose(), this.signals.keyUp.dispose()
            }, Input.prototype.onMouseMove = function(event) {
                this.touch = event.data.getLocalPosition(this._stage), p3.Timestep.queueCall(function() {
                    this.signals.mouseMove.dispatch(event)
                }, [], this)
            }, Input.prototype.onMouseDown = function(event) {
                this.touch = event.data.getLocalPosition(this._stage), this.isTouch = !0, p3.Timestep.queueCall(function() {
                    this.signals.mouseDown.dispatch(event)
                }, [], this)
            }, Input.prototype.onMouseUp = function(event) {
                this.touch = event.data.getLocalPosition(this._stage), this.isTouch = !1, p3.Timestep.queueCall(function() {
                    this.signals.mouseUp.dispatch(event)
                }, [], this)
            }, Input.prototype.onMouseClick = function(event) {
                p3.Timestep.queueCall(function() {
                    this.signals.mouseClick.dispatch(event)
                }, [], this)
            }, Input.prototype.onKeyDown = function(event) {
                switch (event.preventDefault(), event.keyCode) {
                    case Input.keys.UP:
                    case Input.keys.W:
                        this.isKeyUp = !0;
                        break;
                    case Input.keys.LEFT:
                    case Input.keys.A:
                        this.isKeyLeft = !0;
                        break;
                    case Input.keys.RIGHT:
                    case Input.keys.D:
                        this.isKeyRight = !0;
                        break;
                    case Input.keys.DOWN:
                    case Input.keys.S:
                        this.isKeyDown = !0;
                        break;
                    case Input.keys.Z:
                    case Input.keys.SPACE:
                        this.isKeyFire = !0;
                        break;
                    case Input.keys.X:
                        this.isKeyAltFire = !0
                }
                p3.Timestep.queueCall(function() {
                    this.signals.keyDown.dispatch(event)
                }, [], this)
            }, Input.prototype.onKeyUp = function(event) {
                switch (event.preventDefault(), event.keyCode) {
                    case Input.keys.UP:
                    case Input.keys.W:
                        this.isKeyUp = !1;
                        break;
                    case Input.keys.LEFT:
                    case Input.keys.A:
                        this.isKeyLeft = !1;
                        break;
                    case Input.keys.RIGHT:
                    case Input.keys.D:
                        this.isKeyRight = !1;
                        break;
                    case Input.keys.DOWN:
                    case Input.keys.S:
                        this.isKeyDown = !1;
                        break;
                    case Input.keys.Z:
                    case Input.keys.SPACE:
                        this.isKeyFire = !1;
                        break;
                    case Input.keys.X:
                        this.isKeyAltFire = !1
                }
                p3.Timestep.queueCall(function() {
                    this.signals.keyUp.dispatch(event)
                }, [], this)
            }
        }, {}],
        48: [function(require, module, exports) {
            "use strict";

            function IntroScene() {
                this._homeButton = null, this._nextButton = null, this._soundButton = null, this._scene1 = null, this._scene2 = null, this._scene3 = null, this._scene4 = null, this._imageIndex = 0, this._animator = null, p3.Scene.call(this)
            }
            var BenButton = require("./BenButton"),
                BenMuteButton = require("./BenMuteButton"),
                Common = require("./Common"),
                Input = require("./Input"),
                PreloaderScene = require("./PreloaderScene"),
                TransformationEffect = require("./TransformationEffect");
            module.exports = IntroScene, IntroScene.prototype = Object.create(p3.Scene.prototype), IntroScene.prototype.constructor = IntroScene, IntroScene.prototype.preloader = function() {
                return new PreloaderScene
            }, IntroScene.prototype.load = function() {
                return [{
                    name: "intro_bg",
                    url: "images/intro_bg.jpg"
                }, {
                    name: "intro_0",
                    url: "images/intro_0.json"
                }, {
                    name: "transform_0",
                    url: "images/transform_0.json"
                }]
            }, IntroScene.prototype.unload = function() {
                var assets = Common.assets;
                assets.unloadTexture("intro_bg", "jpg"), assets.unloadTexture("intro_0", "png"), assets.unloadTexture("transform_0", "png")
            }, IntroScene.prototype.init = function() {
                p3.Scene.prototype.init.call(this), this._animator = new p3.Animator;
                var bg = new PIXI.Sprite(Common.assets.getTexture("intro_bg"));
                this.addChild(bg), this._scene1 = new PIXI.Container, this._scene1.x = .5 * Common.STAGE_WIDTH, this._scene1.y = .5 * Common.STAGE_HEIGHT, this._scene1.visible = !1, this.addChild(this._scene1), this._scene1.left = new PIXI.Sprite(Common.assets.getTexture("intro_1_001")), this._scene1.left.x = -224, this._scene1.left.anchor = new PIXI.Point(1, .5), this._scene1.addChild(this._scene1.left), this._scene1.top = new PIXI.Sprite(Common.assets.getTexture("intro_1_002")), this._scene1.top.y = -4, this._scene1.top.anchor = new PIXI.Point(.5, 1), this._scene1.addChild(this._scene1.top), this._scene1.top.a = new PIXI.Sprite(Common.assets.getTexture("intro_1_002_contents_001")), this._scene1.top.a.x = 56, this._scene1.top.a.y = -136, this._scene1.top.a.anchor = new PIXI.Point(.5, .5), this._scene1.top.addChild(this._scene1.top.a), this._scene1.right = new PIXI.Sprite(Common.assets.getTexture("intro_1_003")), this._scene1.right.x = 206, this._scene1.right.anchor = new PIXI.Point(0, .5), this._scene1.addChild(this._scene1.right), this._scene1.bottom = new PIXI.Sprite(Common.assets.getTexture("intro_1_004")), this._scene1.bottom.x = 8, this._scene1.bottom.y = -160, this._scene1.bottom.anchor = new PIXI.Point(.5, 0), this._scene1.visible = !1, this._scene1.addChild(this._scene1.bottom), this._scene2 = new PIXI.Container, this._scene2.x = .5 * Common.STAGE_WIDTH, this._scene2.y = .5 * Common.STAGE_HEIGHT, this._scene2.visible = !1, this.addChild(this._scene2), this._scene2.left = new PIXI.Sprite(Common.assets.getTexture("intro_2_001")), this._scene2.left.x = -116, this._scene2.left.anchor = new PIXI.Point(1, .5), this._scene2.addChild(this._scene2.left), this._scene2.right = new PIXI.Sprite(Common.assets.getTexture("intro_2_002")), this._scene2.right.x = -244, this._scene2.right.y = -6, this._scene2.right.anchor = new PIXI.Point(0, .5), this._scene2.addChild(this._scene2.right), this._scene2.right.a = new PIXI.Sprite(Common.assets.getTexture("intro_2_002_contents_001")), this._scene2.right.a.anchor = new PIXI.Point(0, .5), this._scene2.right.addChild(this._scene2.right.a), this._scene3 = new PIXI.Container, this._scene3.x = .5 * Common.STAGE_WIDTH, this._scene3.y = .5 * Common.STAGE_HEIGHT, this._scene3.visible = !1, this.addChild(this._scene3), this._scene3.left = new PIXI.Sprite(Common.assets.getTexture("intro_3_001")), this._scene3.left.x = -134, this._scene3.left.anchor = new PIXI.Point(1, .5), this._scene3.addChild(this._scene3.left), this._scene3.right = new PIXI.Sprite(Common.assets.getTexture("intro_3_003")), this._scene3.right.x = 132, this._scene3.right.anchor = new PIXI.Point(0, .5), this._scene3.addChild(this._scene3.right), this._scene3.center = new PIXI.Sprite(Common.assets.getTexture("intro_3_002")), this._scene3.center.x = -4, this._scene3.center.y = -32, this._scene3.center.anchor = new PIXI.Point(.5, .5), this._scene3.addChild(this._scene3.center), this._scene3.center.a = new PIXI.Sprite(Common.assets.getTexture("intro_3_002_contents_001")), this._scene3.center.a.anchor = new PIXI.Point(.5, .5), this._scene3.center.addChild(this._scene3.center.a), this._scene3.center.effect = new TransformationEffect, this._scene3.center.effect.scale = new PIXI.Point(1.6, 1.6), this._scene3.center.addChild(this._scene3.center.effect), this._scene4 = new PIXI.Container, this._scene4.x = .5 * Common.STAGE_WIDTH, this._scene4.y = .5 * Common.STAGE_HEIGHT, this._scene4.visible = !1, this.addChild(this._scene4), this._scene4.center = new PIXI.Sprite(Common.assets.getTexture("intro_4_001")), this._scene4.center.anchor = new PIXI.Point(.5, .5), this._scene4.addChild(this._scene4.center), this._scene4.ben = new PIXI.Sprite(Common.assets.getTexture("intro_4_002")), this._scene4.ben.x = -240, this._scene4.ben.y = 40, this._scene4.ben.anchor = new PIXI.Point(0, .64), this._scene4.addChild(this._scene4.ben);
                var states = new p3.ButtonStates;
                states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_home_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_home_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._homeButton = new BenButton(states), this._homeButton.y = 80, this._homeButton.animate = !0, this._homeButton.overSoundName = "sfx_btn_rollover_00", this._homeButton.clickSoundName = "sfx_btn_back", this._homeButton.signals.click.add(this.onHomeButtonClick, this), this.addChild(this._homeButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_primary_large_off"), states.over = Common.assets.getTexture("btn_primary_large_over"), states.icon = Common.assets.getTexture("btn_primary_large_icon_play_off"), states.iconOver = Common.assets.getTexture("btn_primary_large_icon_play_over"), states.innerRing = Common.assets.getTexture("btn_primary_large_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_primary_large_off_ring_002"), this._nextButton = new BenButton(states), this._nextButton.y = p3.View.height - 100, this._nextButton.animate = !0, this._nextButton.overSoundName = "sfx_btn_rollover_00", this._nextButton.clickSoundName = "sfx_btn_play_00", this._nextButton.signals.click.add(this.onNextButtonClick, this), this.addChild(this._nextButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_audio_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_audio_over"), states.iconAlt = Common.assets.getTexture("btn_tertuary_icon_mute_off"), states.iconOverAlt = Common.assets.getTexture("btn_tertuary_icon_mute_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._soundButton = new BenMuteButton(states), this._soundButton.y = 80, this._soundButton.animate = !0, this._soundButton.overSoundName = "sfx_btn_rollover_00", this._soundButton.clickSoundName = "sfx_btn_press_00", this.addChild(this._soundButton), this.showNext()
            }, IntroScene.prototype.destroy = function() {
                Common.input.signals.keyUp.remove(this.onKeyUp, this), this._animator.removeAll(), this._homeButton.destroy(), this._nextButton.destroy(), this._soundButton.destroy(), p3.Scene.prototype.destroy.call(this)
            }, IntroScene.prototype.resize = function() {
                this.x = .5 * (p3.View.width - Common.STAGE_WIDTH), this._homeButton.x = .5 * (Common.STAGE_WIDTH - p3.View.width) + 80, this._nextButton.x = .5 * (Common.STAGE_WIDTH + p3.View.width) - 100, this._soundButton.x = .5 * (Common.STAGE_WIDTH + p3.View.width) - 80
            }, IntroScene.prototype.appear = function() {
                p3.Scene.prototype.appear.call(this), Common.input.signals.keyUp.add(this.onKeyUp, this)
            }, IntroScene.prototype.animateScene1 = function() {
                this._scene1.alpha = 1, this._scene1.visible = !0, this._animator.removeAll();
                var to, offset = .4,
                    delay = .8;
                to = new PIXI.Point(this._scene1.left.x, this._scene1.left.y), this._scene1.left.x -= 440, this._scene1.left.alpha = 0, this._animator.add(TweenMax.to(this._scene1.left, .34, {
                    delay: offset,
                    x: to.x,
                    alpha: 1,
                    ease: Power2.easeOut
                })), to = new PIXI.Point(this._scene1.top.x, this._scene1.top.y), this._scene1.top.y += 280, this._scene1.top.alpha = 0, this._animator.add(TweenMax.to(this._scene1.top, .34, {
                    delay: offset + delay,
                    y: to.y,
                    alpha: 1,
                    ease: Power2.easeOut
                })), to = new PIXI.Point(this._scene1.right.x, this._scene1.right.y), this._scene1.right.x += 440, this._scene1.right.alpha = 0, this._animator.add(TweenMax.to(this._scene1.right, .34, {
                    delay: offset + 2 * delay,
                    x: to.x,
                    alpha: 1,
                    ease: Power2.easeOut
                })), to = new PIXI.Point(this._scene1.bottom.x, this._scene1.bottom.y), this._scene1.bottom.y += 280, this._scene1.bottom.alpha = 0, this._animator.add(TweenMax.to(this._scene1.bottom, .34, {
                    delay: offset + 3 * delay,
                    y: to.y,
                    alpha: 1,
                    ease: Power2.easeOut
                })), this._scene1.top.a.scale = new PIXI.Point, this._animator.add(TweenMax.to(this._scene1.top.a.scale, .34, {
                    delay: offset + 3.2 * delay,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2],
                    onStart: function() {
                        Common.audio.playSound("sfx_drone_impact_00")
                    }
                })), this._animator.add(TweenMax.to(this._scene1, .24, {
                    delay: offset + 5 * delay,
                    alpha: 0,
                    ease: Power1.easeInOut
                })), this._animator.add(TweenMax.to(this, 0, {
                    delay: offset + 6 * delay,
                    onStart: function() {
                        this.showNext()
                    },
                    onStartScope: this
                }))
            }, IntroScene.prototype.animateScene2 = function() {
                this._scene2.alpha = 1, this._scene2.visible = !0, this._animator.removeAll();
                var to, offset = .2,
                    delay = .8;
                to = new PIXI.Point(this._scene2.left.x, this._scene2.left.y), this._scene2.left.x -= 440, this._scene2.left.alpha = 0, this._animator.add(TweenMax.to(this._scene2.left, .34, {
                    delay: offset,
                    x: to.x,
                    alpha: 1,
                    ease: Power2.easeOut
                })), to = new PIXI.Point(this._scene2.right.x, this._scene2.right.y), this._scene2.right.x += 440, this._scene2.right.alpha = 0, this._animator.add(TweenMax.to(this._scene2.right, .34, {
                    delay: offset + delay,
                    x: to.x,
                    alpha: 1,
                    ease: Power2.easeOut
                })), this._scene2.right.a.texture = Common.assets.getTexture("intro_2_002_contents_001"), this._animator.add(TweenMax.to(this._scene2.right.a, 0, {
                    delay: offset + 2 * delay,
                    onStart: function() {
                        this._scene2.right.a.texture = Common.assets.getTexture("intro_2_002_contents_002"), Common.audio.playSound("sfx_robot_leg_out")
                    },
                    onStartScope: this
                })), this._animator.add(TweenMax.to(this._scene2.right.a, 0, {
                    delay: offset + 3 * delay,
                    onStart: function() {
                        this._scene2.right.a.texture = Common.assets.getTexture("intro_2_002_contents_003")
                    },
                    onStartScope: this
                })), this._animator.add(TweenMax.to(this._scene2, .24, {
                    delay: offset + 5 * delay,
                    alpha: 0,
                    ease: Power1.easeInOut
                })), this._animator.add(TweenMax.to(this, 0, {
                    delay: offset + 6 * delay,
                    onStart: function() {
                        this.showNext()
                    },
                    onStartScope: this
                }))
            }, IntroScene.prototype.animateScene3 = function() {
                this._scene3.alpha = 1, this._scene3.visible = !0, this._animator.removeAll();
                var to, offset = .2,
                    delay = .8;
                to = new PIXI.Point(this._scene3.left.x, this._scene3.left.y), this._scene3.left.x -= 440, this._scene3.left.alpha = 0, this._animator.add(TweenMax.to(this._scene3.left, .34, {
                    delay: offset,
                    x: to.x,
                    alpha: 1,
                    ease: Power2.easeOut
                })), to = new PIXI.Point(this._scene3.center.x, this._scene3.center.y), this._scene3.center.y -= 280, this._scene3.center.alpha = 0, this._animator.add(TweenMax.to(this._scene3.center, .34, {
                    delay: offset + delay,
                    y: to.y,
                    alpha: 1,
                    ease: Power2.easeOut,
                    onStart: function() {
                        Common.audio.playSound("sfx_omnitrix_open_00")
                    }
                })), this._scene3.center.a.texture = Common.assets.getTexture("intro_3_002_contents_001"), this._animator.add(TweenMax.to(this._scene3.center.a, .4, {
                    delay: offset + 2 * delay,
                    onStart: function() {
                        this._scene3.center.effect.animate(), Common.audio.playSound("sfx_omnitrix_transform_00")
                    },
                    onStartScope: this,
                    onComplete: function() {
                        this._scene3.center.a.texture = Common.assets.getTexture("intro_3_002_contents_002")
                    },
                    onCompleteScope: this
                })), to = new PIXI.Point(this._scene3.right.x, this._scene3.right.y), this._scene3.right.x += 440, this._scene3.right.alpha = 0, this._animator.add(TweenMax.to(this._scene3.right, .34, {
                    delay: offset + 3 * delay,
                    x: to.x,
                    alpha: 1,
                    ease: Power2.easeOut
                })), this._animator.add(TweenMax.to(this._scene3, .24, {
                    delay: offset + 5 * delay,
                    alpha: 0,
                    ease: Power1.easeInOut
                })), this._animator.add(TweenMax.to(this, 0, {
                    delay: offset + 6 * delay,
                    onStart: function() {
                        this.showNext()
                    },
                    onStartScope: this
                }))
            }, IntroScene.prototype.animateScene4 = function() {
                this._scene4.alpha = 1, this._scene4.visible = !0, this._animator.removeAll();
                var to, offset = .2,
                    delay = .8;
                to = new PIXI.Point(this._scene4.center.x, this._scene4.center.y), this._scene4.center.y += 280, this._scene4.center.alpha = 0, this._animator.add(TweenMax.to(this._scene4.center, .34, {
                    delay: offset,
                    y: to.y,
                    alpha: 1,
                    ease: Power2.easeOut
                })), to = new PIXI.Point(this._scene4.ben.x, this._scene4.ben.y), this._scene4.ben.x -= 80, this._scene4.ben.alpha = 0, this._animator.add(TweenMax.to(this._scene4.ben, .34, {
                    delay: offset + delay,
                    x: to.x,
                    alpha: 1,
                    ease: Power2.easeOut
                })), this._scene4.ben.scale = new PIXI.Point, this._animator.add(TweenMax.to(this._scene4.ben.scale, .4, {
                    delay: offset + delay,
                    x: 1,
                    y: 1,
                    ease: Power1.easeInOut,
                    onStart: function() {
                        Common.audio.playSound("vo_ben_woohoo_00")
                    }
                })), this._animator.add(TweenMax.to(this, 0, {
                    delay: offset + 3 * delay,
                    onStart: function() {
                        this.showNext()
                    },
                    onStartScope: this
                }))
            }, IntroScene.prototype.update = function() {
                this._animator.update(p3.Timestep.deltaTime), this._scene3.visible && this._scene3.center.effect.update()
            }, IntroScene.prototype.showNext = function() {
                switch (this._imageIndex++) {
                    case 0:
                        this.animateScene1();
                        break;
                    case 1:
                        this.animateScene2();
                        break;
                    case 2:
                        this.animateScene3();
                        break;
                    case 3:
                        this.animateScene4();
                        break;
                    case 4:
                        this._nextButton.visible = !0
                }
            }, IntroScene.prototype.onHomeButtonClick = function(button) {
                this.signals.home.dispatch(this)
            }, IntroScene.prototype.onNextButtonClick = function(button) {
                this.signals.next.dispatch(this)
            }, IntroScene.prototype.onCloseButtonClick = function(button) {
                this.signals.next.dispatch(this)
            }, IntroScene.prototype.onKeyUp = function(event) {
                event.keyCode == Input.keys.ENTER && this.onNextButtonClick(null)
            }
        }, {
            "./BenButton": 12,
            "./BenMuteButton": 13,
            "./Common": 25,
            "./Input": 47,
            "./PreloaderScene": 57,
            "./TransformationEffect": 69
        }],
        49: [function(require, module, exports) {
            "use strict";

            function Joystick() {
                PIXI.Container.call(this), this.signals = {}, this.signals.input = new signals.Signal, this.deadzone = 16, this._active = !1, this._padding = new PIXI.Graphics, this.addChild(this._padding), this._area = new PIXI.Sprite(Common.assets.getTexture("btn_joystick_pad")), this._area.anchor = new PIXI.Point(.5, .5), this.addChild(this._area), this._thumb = new PIXI.Sprite(Common.assets.getTexture("btn_joystick_stick")), this._thumb.x = 2, this._thumb.y = 2, this._thumb.anchor = new PIXI.Point(.5, .5), this.addChild(this._thumb), this._axis = new PIXI.Point, this.interactive = !0, this.hitArea = new PIXI.Rectangle(0, 0, p3.View.width, p3.View.height);
                var that = this;
                this.mousedown = this.touchstart = function() {
                    that.onMouseDown.call(that)
                }, this.mouseup = this.touchend = function() {
                    that.onMouseUp.call(that)
                }, this._padding.interactive = !0, Common.input.isKeyLeft = Common.input.isKeyRight = Common.input.isKeyUp = Common.input.isKeyDown = !1
            }
            var Common = require("./Common");
            module.exports = Joystick, Joystick.prototype = Object.create(PIXI.Container.prototype), Joystick.prototype.constructor = Joystick, Joystick.prototype.destroy = function() {
                Common.input.signals.mouseUp.remove(this.onMouseUp, this), PIXI.Container.prototype.destroy.call(this)
            }, Joystick.prototype.resize = function() {
                this._padding.clear(), this._padding.beginFill(16711680, 0), this._padding.drawRect(-this.x, -this.y, p3.View.width, p3.View.height), this._padding.endFill()
            }, Joystick.prototype.update = function() {
                var target = new PIXI.Point;
                this._active && (target = this.toLocal(new PIXI.Point(Common.input.touch.x, Common.input.touch.y), Common.stage));
                var ease = .44;
                this._thumb.x += (target.x - this._thumb.x) * ease, this._thumb.y += (target.y - this._thumb.y) * ease;
                var distance = Math.sqrt(this._thumb.x * this._thumb.x + this._thumb.y * this._thumb.y),
                    angle = Math.atan2(this._thumb.y, this._thumb.x),
                    radius = 80;
                distance > radius && (this._thumb.x = Math.cos(angle) * radius, this._thumb.y = Math.sin(angle) * radius), this._axis.x = 0 != this._thumb.x && Math.abs(this._thumb.x) > this.deadzone ? this._thumb.x / Math.abs(this._thumb.x) : 0, this._axis.y = 0 != this._thumb.y && Math.abs(this._thumb.y) > this.deadzone ? this._thumb.y / Math.abs(this._thumb.y) : 0, this.active && (distance > this.deadzone ? this.signals.input.dispatch(this, this._axis.clone()) : this.signals.input.dispatch(this, new PIXI.Point))
            }, Joystick.prototype.onMouseDown = function(event) {
                this._active = !0
            }, Joystick.prototype.onMouseUp = function(event) {
                this._active = !1, this.signals.input.dispatch(this, new PIXI.Point)
            }, Object.defineProperty(Joystick.prototype, "active", {
                get: function() {
                    return this._active
                }
            }), Object.defineProperty(Joystick.prototype, "axis", {
                get: function() {
                    return this._axis
                }
            })
        }, {
            "./Common": 25
        }],
        50: [function(require, module, exports) {
            "use strict";

            function Main(width, height) {
                this._width = width, this._height = height, this._preloader = null, this._game = null
            }
            var Application = require("./Application"),
                AudioManager = require("./AudioManager"),
                Common = require("./Common"),
                Input = require("./Input"),
                CNPreloaderScene = require("./CNPreloaderScene");
            window.Main = Main, Main.prototype.init = function() {
                Common.assets = p3.AssetManager.instance, Common.audio = p3.Button.audio = new AudioManager, Common.language = language;
                var params = new p3.ViewParams;
                params.holderId = "game", params.width = this._width, params.height = this._height, params.rotateImageUrl = "./assets/images/localisation/rotate_" + Common.language + ".jpg", params.rotateImageColor = "#000000", PIXI.RETINA_PREFIX = /\_(?=[^_]*$)(.+)x/, p3.Device.init(window.bowser), TweenMax.defaultOverwrite = "none", TweenMax.ticker.fps(60);
                var view = new p3.View(params);
                view.signals.ready.addOnce(function(canvas) {
                    var options = {};
                    options.view = canvas, options.transparent = !1, options.antialias = !1, options.preserveDrawingBuffer = !1, options.resolution = 1;
                    var stage = new PIXI.Container;
                    Common.stage = stage;
                    var input = new Input;
                    input.init(stage, canvas), Common.input = input, p3.Device.isCocoonJS && (stage.scale.x = window.innerHeight / params.height, stage.scale.y = window.innerHeight / params.height);
                    var renderer = p3.Device.isCocoonJS ? new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, options) : PIXI.autoDetectRenderer(this._width, this._height, options);
                    renderer.backgroundColor = 0, Common.renderer = renderer, Common.isWebGL = renderer instanceof PIXI.WebGLRenderer;
                    var sm = new p3.SceneManager(renderer);
                    Common.scene = sm, Common.stage.addChild(sm.view);
                    var timestep = new p3.Timestep(p3.Timestep.FIXED);
                    timestep.init(this.update, this.render, this), Common.timestep = timestep, Common.animator = new p3.Animator, Common.animator.init(), window.delay = function(callback, delay, scope) {
                        return Common.animator.setTimeout(callback, delay, scope)
                    }, this.loadPreloader()
                }, this), view.signals.resize.add(this.onCanvasResize, this), Common.view = view
            }, Main.prototype.loadPreloader = function() {
                var files = [{
                        name: "preloader_bg",
                        url: "images/preloader_bg.jpg"
                    }, {
                        name: "preloader_0",
                        url: "images/preloader_0.json"
                    }, {
                        name: "cn_preloader_bg",
                        url: "images/cn_preloader_bg.jpg"
                    }, {
                        name: "cn_preloader",
                        url: "images/cn_preloader.json"
                    }, {
                        name: "particles_0",
                        url: "images/particles_0.json"
                    }, {
                        name: "preloader_radial_spray",
                        url: "particles/preloader_radial_spray.json"
                    }, {
                        name: "particle_emitter_player_hit_00",
                        url: "particles/particle_emitter_player_hit_00.json"
                    }, {
                        name: "particle_emitter_boss_hit_00",
                        url: "particles/particle_emitter_boss_hit_00.json"
                    }, {
                        name: "particle_emitter_drone_explode_00",
                        url: "particles/particle_emitter_drone_explode_00.json"
                    }, {
                        name: "particle_emitter_explosion_smoke_00",
                        url: "particles/particle_emitter_explosion_smoke_00.json"
                    }, {
                        name: "particle_emitter_explosion_big_smoke_00",
                        url: "particles/particle_emitter_explosion_big_smoke_00.json"
                    }, {
                        name: "particle_emitter_pickup_hexshield_00",
                        url: "particles/particle_emitter_pickup_hexshield_00.json"
                    }, {
                        name: "particle_emitter_pickup_transform_00",
                        url: "particles/particle_emitter_pickup_transform_00.json"
                    }, {
                        name: "particle_transform_pickup_attract_add_00",
                        url: "particles/particle_transform_pickup_attract_add_00.json"
                    }, {
                        name: "particle_emitter_heatblast_platform_00",
                        url: "particles/particle_emitter_heatblast_platform_00.json"
                    }, {
                        name: "particle_emitter_crash",
                        url: "particles/particle_emitter_crash.json"
                    }, {
                        name: "ahkio_26_game",
                        url: "fonts/ahkio_26_game.xml"
                    }, {
                        name: "ahkio_60_white_endgame",
                        url: "fonts/ahkio_60_white_endgame.xml"
                    }, {
                        name: "ahkio_70_preloader",
                        url: "fonts/ahkio_70_preloader.xml"
                    }, {
                        name: "ahkio_75_paused",
                        url: "fonts/ahkio_75_paused.xml"
                    }, {
                        name: "ahkio_90_endgame",
                        url: "fonts/ahkio_90_endgame.xml"
                    }, {
                        name: "ahkio_90_orange_endgame",
                        url: "fonts/ahkio_90_orange_endgame.xml"
                    }, {
                        name: "ahkio_100_green_endgame",
                        url: "fonts/ahkio_100_green_endgame.xml"
                    }],
                    sounds = [];
                files.length ? (Common.assets.addFiles(files, "assets/"), Common.assets.signals.complete.addOnce(function() {
                    this.loadAssets()
                }, this), Common.assets.load(), Common.audio.addSounds(sounds, [".mp3", ".ogg"], "")) : this.loadAssets()
            }, Main.prototype.loadAssets = function() {
                var files = [{
                        name: "splash_bg",
                        url: "images/splash_bg.jpg"
                    }, {
                        name: "paused_bg",
                        url: "images/paused_bg.jpg"
                    }, {
                        name: "title",
                        url: "images/localisation/title_" + Common.language + ".png"
                    }, {
                        name: "buttons",
                        url: "images/buttons.json"
                    }, {
                        name: "ui_0",
                        url: "images/ui_0.json"
                    }, {
                        name: "ui_1",
                        url: "images/ui_1.json"
                    }, {
                        name: "config",
                        url: "data/config.json"
                    }, {
                        name: "copy",
                        url: "data/languages.json"
                    }, {
                        name: "level1",
                        url: "data/level1.json"
                    }, {
                        name: "level1_paths",
                        url: "data/level1_paths.json"
                    }, {
                        name: "level2",
                        url: "data/level2.json"
                    }, {
                        name: "level2_paths",
                        url: "data/level2_paths.json"
                    }, {
                        name: "level3",
                        url: "data/level3.json"
                    }, {
                        name: "level3_paths",
                        url: "data/level3_paths.json"
                    }, {
                        name: "level4",
                        url: "data/level4.json"
                    }, {
                        name: "level4_paths",
                        url: "data/level4_paths.json"
                    }, {
                        name: "level5",
                        url: "data/level5.json"
                    }, {
                        name: "level5_paths",
                        url: "data/level5_paths.json"
                    }],
                    sounds = ["music_end_quiet_00", "music_main_fullloop_quiet_00", "music_ben10_powersurge_final", "sfx_btn_back", "sfx_btn_play_00", "sfx_btn_press_00", "sfx_btn_rollover_00", "sfx_menu_swipe_00", "sfx_omnitrix_open_00", "sfx_omnitrix_transform_00", "sfx_omnitrix_transform_back_00", "sfx_robot_leg_out", "sfx_enemy_fire_00", "sfx_enemy_weapon_activate_00", "sfx_fire_missile_00", "sfx_drone_impact_00", "sfx_drone_shutdown_00", "sfx_drone_explode_00", "sfx_drone_explode_01", "sfx_drone_explode_02", "sfx_drone_explode_03", "sfx_drone_explode_04", "sfx_drone_loop_00", "sfx_drone_loop_01", "sfx_drone_loop_02", "sfx_drone_loop_03", "sfx_fire_laser_00", "sfx_ben_shoot_4_00", "sfx_ben_shoot_4_01", "sfx_ben_shoot_4_02", "sfx_ben_shoot_4_03", "sfx_heatblast_shoot_flame_04_00", "sfx_heatblast_shoot_flame_04_01", "sfx_heatblast_shoot_flame_04_02", "sfx_heatblast_shoot_flame_04_03", "sfx_stinkfly_shoot_02", "sfx_stinkfly_gasattack_00", "sfx_stinkfly_gasattack_01", "sfx_stinkfly_gloophit_00", "sfx_heatblast_appear_00", "sfx_heatblast_fly_loop_00", "sfx_heatblast_fly_loop_01", "sfx_stinkfly_flap_00", "sfx_boom01", "sfx_boom02", "sfx_boom03", "vo_ben_win_haaa_00", "vo_ben_woohoo_00", "vo_ben_surprise_00", "vo_ben_hurt_00", "vo_ben_oohoof_00"];
                files.length ? (this._preloader = new CNPreloaderScene, Common.scene.add(this._preloader), Common.assets.addFiles(files, "assets/"), Common.assets.signals.progress.add(this.onLoadingProgress, this), Common.assets.signals.complete.addOnce(this.onLoadingCompleted, this), Common.assets.load(), Common.audio.addSounds(sounds, [".mp3", ".ogg"], "assets/audio/")) : this.startGame()
            }, Main.prototype.startGame = function() {
                delay(function() {
                    this._game = new Application, this._game.init()
                }, 1, this)
            }, Main.prototype.update = function() {
                Common.scene.update(), Common.animator.update()
            }, Main.prototype.render = function() {
                Common.renderer.render(Common.stage)
            }, Main.prototype.onLoadingProgress = function(event) {
                this._preloader.loaded = event.progress / 100
            }, Main.prototype.onLoadingCompleted = function() {
                Common.assets.signals.progress.removeAll(), Common.assets.signals.complete.removeAll(), this._preloader.loaded = 1, Common.config = Common.assets.getJSON("config"), Common.copy = Common.assets.getJSON("copy"), delay(function() {
                    this.startGame()
                }, .4, this)
            }, Main.prototype.onCanvasResize = function(correct) {
                correct && (Common.renderer.resize(p3.View.width, p3.View.height), Common.scene && Common.scene.resize())
            }
        }, {
            "./Application": 7,
            "./AudioManager": 8,
            "./CNPreloaderScene": 24,
            "./Common": 25,
            "./Input": 47
        }],
        51: [function(require, module, exports) {
            function Missile(sequence, owner, target, direction) {
                this.rotationVelocity = 0, this.rotationVelocityMax = 1, this.rotationAccel = 1, this._target = target, this._angle = 0, this._hadTarget = !!this._target, Bullet.call(this, sequence, owner, direction)
            }
            var AudioParams = (require("./AI"), require("./AudioParams")),
                Bullet = require("./Bullet"),
                Common = require("./Common"),
                MissileTypes = require("./MissileTypes");
            module.exports = Missile, Missile.prototype = Object.create(Bullet.prototype), Missile.prototype.constructor = Missile, Missile.create = function(type, owner, target, direction) {
                var info, damage, baseSpeed, fireSound, explodeSound, leaveTrail, life, w, h, scale = new PIXI.Point(1, 1),
                    aabb = new PIXI.Rectangle,
                    config = Common.config,
                    sequence = new p3.MovieClipSequence,
                    fireSoundParams = new AudioParams,
                    explodeSoundParams = new AudioParams;
                switch (type) {
                    case MissileTypes.DRONE_MISSILE:
                        info = config.powerups[MissileTypes.DRONE_MISSILE], damage = info.damage, baseSpeed = info.speed, fireSound = "sfx_torpedo_06", explodeSound = [], leaveTrail = !1, life = 6, fireSoundParams.volume = 1, explodeSoundParams.volume = 1, w = 36, h = 20, aabb = new PIXI.Rectangle(.5 * -w, .5 * -h, w, h), sequence.addTextures([Common.assets.getTexture("projectile_bomb_ben_002")]), this.rotationVelocityMax = 6.2, this.rotationAccel = 4.8;
                        break;
                    case MissileTypes.BOSS_MISSILE:
                        info = config.powerups[MissileTypes.BOSS_MISSILE], damage = info.damage, baseSpeed = info.speed, fireSound = "sfx_torpedo_06", explodeSound = [], leaveTrail = !1, life = 2.4, fireSoundParams.volume = 1, explodeSoundParams.volume = 1, w = 64, h = 20, aabb = new PIXI.Rectangle(.5 * -w, .5 * -h, w, h), sequence.addTextures([Common.assets.getTexture("projectile_boss_gun")]), this.rotationVelocityMax = 3.2, this.rotationAccel = 2.8
                }
                var missile = new Missile(sequence, owner, target, direction);
                return missile.damage = damage, missile.baseSpeed = baseSpeed, missile.fireSound = fireSound, missile.fireSoundParams = fireSoundParams, missile.explodeSound = explodeSound, missile.explodeSoundParams = explodeSoundParams, missile.leaveTrail = leaveTrail, missile.life = life, missile.view.looping = !0, missile.view.scale = scale, missile.view.aabb = aabb, missile.rotateToDir = !1, missile
            }, Missile.prototype.init = function() {
                Bullet.prototype.init.call(this), this._angle = Math.atan2(this._direction.y, this._direction.x)
            }, Missile.prototype.update = function() {
                if (this.target && this.target.parent) {
                    var to = new p3.Vector2(this._target.x - this.x, this._target.y - this.y);
                    to.normalize(1);
                    var pp = this._direction.perpProduct(to);
                    pp > 0 ? (this.rotationVelocity += this.rotationAccel * p3.Timestep.deltaTime, this.rotationVelocity = Math.abs(this.rotationVelocity) > this.rotationVelocityMax ? this.rotationVelocityMax * (this.rotationVelocity / Math.abs(this.rotationVelocity)) : this.rotationVelocity, this._angle += this.rotationVelocity * p3.Timestep.deltaTime) : pp < 0 && (this.rotationVelocity -= this.rotationAccel * p3.Timestep.deltaTime, this.rotationVelocity = Math.abs(this.rotationVelocity) > this.rotationVelocityMax ? this.rotationVelocityMax * (this.rotationVelocity / Math.abs(this.rotationVelocity)) : this.rotationVelocity, this._angle += this.rotationVelocity * p3.Timestep.deltaTime);
                    var dp = this._direction.dotProduct(to);
                    Math.acos(dp) > .1 ? (this._direction.x = Math.cos(this._angle), this._direction.y = Math.sin(this._angle)) : this.rotationVelocity = 0, this.velocity.x = this._direction.x * this.baseSpeed, this.velocity.y = this._direction.y * this.baseSpeed, this.rotation = Math.atan2(this._direction.y, this._direction.x)
                }
                this._hadTarget && !this.target.parent && this.takeDamage(Number.MAX_VALUE), Bullet.prototype.update.call(this)
            }, Missile.prototype.takeDamage = function(damage) {
                if (Bullet.prototype.takeDamage.call(this, damage), this.dead) {
                    var config = Common.assets.getJSON("particle_emitter_explosion_smoke_00");
                    config.maxParticles = .4 * config.maxParticles;
                    var emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config);
                    emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter)
                }
            }, Object.defineProperty(Missile.prototype, "target", {
                get: function() {
                    return this._target
                }
            })
        }, {
            "./AI": 1,
            "./AudioParams": 9,
            "./Bullet": 22,
            "./Common": 25,
            "./MissileTypes": 53
        }],
        52: [function(require, module, exports) {
            "use strict";

            function MissileBomb(owner) {
                Bomb.call(this, owner)
            }
            var Bomb = require("./Bomb"),
                Common = require("./Common"),
                Missile = require("./Missile"),
                MissileTypes = require("./MissileTypes");
            module.exports = MissileBomb, MissileBomb.prototype = Object.create(Bomb.prototype), MissileBomb.prototype.constructor = MissileBomb, MissileBomb.prototype.activate = function(position, targets, count) {
                for (var missile, target, angle, direction, spacing = 2 * Math.PI / count, i = 0; i < count; ++i) target = i < targets.length ? targets[i] : null, angle = spacing * i - .5 * Math.PI, direction = new p3.Vector2(Math.cos(angle), Math.sin(angle)), missile = Missile.create(MissileTypes.DRONE_MISSILE, this.owner, target, direction), missile.x = position.x, missile.y = position.y, this.signals.fire.dispatch(missile);
                Common.audio.playSound("sfx_fire_missile_00"), Bomb.prototype.activate.call(this)
            }
        }, {
            "./Bomb": 14,
            "./Common": 25,
            "./Missile": 51,
            "./MissileTypes": 53
        }],
        53: [function(require, module, exports) {
            "use strict";

            function MissileTypes() {}
            module.exports = MissileTypes, MissileTypes.DRONE_MISSILE = "dronemissile", MissileTypes.BOSS_MISSILE = "bossmissile"
        }, {}],
        54: [function(require, module, exports) {
            "use strict";

            function Player() {
                this.speed = 2620, this.linearDamping = .9, this.rotateAmount = .023, this.rotateSmooth = 280, this.scrollRate = 280, this.fireOffset = new PIXI.Point(54, 0), this.fireRate = .34, this._fireTime = 0, this._invulnerable = !1, this._invFlashFrame = 0, this._smokeEmitter = null, Actor.call(this), this.signals.fire = new signals.Signal
            }
            var Actor = require("./Actor"),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common");
            module.exports = Player, Player.prototype = Object.create(Actor.prototype), Player.prototype.constructor = Player, Player.prototype.init = function() {
                this.spine.update(p3.Timestep.deltaTime)
            }, Player.prototype.reset = function() {
                Actor.prototype.reset.call(this)
            }, Player.prototype.destroy = function() {
                this.signals.fire.dispose(), this._smokeEmitter && (this._smokeEmitter.destroy(), this._smokeEmitter = null), Actor.prototype.destroy.call(this)
            }, Player.prototype.update = function() {
                var input = Common.input;
                this.dead || (input.isKeyLeft && (this.velocity.x += -this.speed * p3.Timestep.deltaTime), input.isKeyRight && (this.velocity.x += this.speed * p3.Timestep.deltaTime), input.isKeyUp && (this.velocity.y += -this.speed * p3.Timestep.deltaTime), input.isKeyDown && (this.velocity.y += this.speed * p3.Timestep.deltaTime), this._fireTime <= 0 && this.fire()), this.x += this.velocity.x * p3.Timestep.deltaTime, this.y += this.velocity.y * p3.Timestep.deltaTime, this.velocity.x *= this.linearDamping, this.velocity.y *= this.linearDamping;
                var rotate = this.velocity.y / Math.max(1, this.rotateSmooth) * Math.PI;
                this.rotation = rotate * this.rotateAmount, Math.abs(this.velocity.x) < 1 && (this.velocity.x = 0), Math.abs(this.velocity.y) < 1 && (this.velocity.y = 0), this._fireTime > 0 && (this._fireTime -= p3.Timestep.deltaTime), this._invulnerable && (this.visible = this._invFlashFrame++ % 8 < 2), this._smokeEmitter && (this._smokeEmitter.updateOwnerPos(this.x, this.y), this._smokeEmitter.update(p3.Timestep.deltaTime)), Actor.prototype.update.call(this)
            }, Player.prototype.fire = function() {
                this._fireTime = this.fireRate;
                var type = BulletTypes.FIRE_BALL,
                    position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y),
                    rotation = 0,
                    direction = new p3.Vector2(1, 0);
                this.signals.fire.dispatch(type, this, position, rotation, direction, !1)
            }, Player.prototype.takeDamage = function(damage, animate) {
                this._invulnerable || Actor.prototype.takeDamage.call(this, damage, animate)
            }, Player.prototype.makeInvulnerable = function(duration) {
                duration = duration || 1, this._invulnerable = !0, delay(function() {
                    this._invulnerable = !1, this._invFlashFrame = 0, this.visible = !0
                }, duration, this)
            }, Player.prototype.deathAnimation = function() {
                var config, emitter;
                config = Common.assets.getJSON("particle_emitter_crash"), this._smokeEmitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), this._smokeEmitter.emit = !0, this._smokeEmitter.updateOwnerPos(this.x, this.y), config = Common.assets.getJSON("particle_emitter_explosion_smoke_00"), emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_smoke_001"), Common.assets.getTexture("particle_smoke_002"), Common.assets.getTexture("particle_smoke_003"), Common.assets.getTexture("particle_smoke_004")], config), emitter.emit = !0, emitter.updateOwnerPos(this.x, this.y), Common.animator.add(emitter)
            }, Object.defineProperty(Player.prototype, "invulnerable", {
                get: function() {
                    return this._invulnerable
                }
            })
        }, {
            "./Actor": 5,
            "./BulletTypes": 23,
            "./Common": 25
        }],
        55: [function(require, module, exports) {
            "use strict";

            function Powerup(type, level) {
                type = type || PowerupTypes.ALIEN_UPGRADE, level = level || 0, Actor.call(this);
                var texture;
                switch (type) {
                    case PowerupTypes.ALIEN_UPGRADE:
                        texture = Common.assets.getTexture("icon_level_up");
                        break;
                    case PowerupTypes.BOMB:
                        texture = Common.assets.getTexture("icon_bomb")
                }
                this.view = new PIXI.Sprite(texture), this.view.anchor = new PIXI.Point(.5, .5), this.addChild(this.view), this.looping = !0, this._type = type, this._collected = !1, this._emitter = null, this.signals.collect = new signals.Signal;
                var width = 48,
                    height = 48;
                this.aabb = new PIXI.Rectangle(.5 * -width, .5 * -height, width, height)
            }
            var Actor = require("./Actor"),
                Common = require("./Common"),
                PowerupTypes = require("./PowerupTypes");
            module.exports = Powerup, Powerup.prototype = Object.create(Actor.prototype), Powerup.prototype.constructor = Powerup, Powerup.prototype.init = function() {
                var config = Common.assets.getJSON("particle_transform_pickup_attract_add_00");
                config.maxParticles = .4 * config.maxParticles, this._emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_001")], config), this._emitter.emit = !0, this._emitter.updateOwnerPos(this.x, this.y), Common.animator.add(this._emitter)
            }, Powerup.prototype.destroy = function() {
                this.signals.collect.dispose(), this._emitter && (this._emitter.destroy(), this._emitter = null), Actor.prototype.destroy.call(this)
            }, Powerup.prototype.update = function() {
                Actor.prototype.update.call(this), this._emitter && this._emitter.updateOwnerPos(this.x, this.y)
            }, Powerup.prototype.collect = function(owner) {
                this._collected || (this._collected = !0, this.signals.collect.dispatch(this, owner), Common.animator.add(TweenMax.to(this.scale, .2, {
                    x: 0,
                    y: 0,
                    ease: Back.easeIn,
                    easeParams: [2]
                })))
            }, Object.defineProperty(Powerup.prototype, "type", {
                get: function() {
                    return this._type
                }
            }), Object.defineProperty(Powerup.prototype, "collected", {
                get: function() {
                    return this._collected
                }
            })
        }, {
            "./Actor": 5,
            "./Common": 25,
            "./PowerupTypes": 56
        }],
        56: [function(require, module, exports) {
            function PowerupTypes() {}
            module.exports = PowerupTypes, PowerupTypes.ALIEN_UPGRADE = 0, PowerupTypes.BOMB = 1
        }, {}],
        57: [function(require, module, exports) {
            "use strict";

            function PreloaderScene() {
                this.loaded = 0, this._spinnerCenter = null, this._spinnerBlack = null, this._spinnerWhite = null, this._radials = [], this._emitterHolder = null, this._emitter = null, this._tweens = [], p3.Scene.call(this)
            }
            var Common = require("./Common"),
                DistortionEffect = require("./DistortionEffect");
            module.exports = PreloaderScene, PreloaderScene.prototype = Object.create(p3.Scene.prototype), PreloaderScene.prototype.constructor = PreloaderScene, PreloaderScene.prototype.init = function() {
                var bg = new PIXI.Sprite(Common.assets.getTexture("preloader_bg"));
                this.addChild(bg);
                for (var radial, textures = [Common.assets.getTexture("preloader_radial_001"), Common.assets.getTexture("preloader_radial_002"), Common.assets.getTexture("preloader_radial_003"), Common.assets.getTexture("preloader_radial_004"), Common.assets.getTexture("preloader_radial_005"), Common.assets.getTexture("preloader_radial_006"), Common.assets.getTexture("preloader_radial_007"), Common.assets.getTexture("preloader_radial_008")], offset = Math.random() * (2 * Math.PI), angle = 2 * Math.PI / textures.length, i = 0; i < textures.length; ++i) radial = new PIXI.Sprite(textures[i]), radial.rotation = offset + i * angle, radial.x = .5 * Common.STAGE_WIDTH + 140 * Math.sin(radial.rotation), radial.y = .5 * Common.STAGE_HEIGHT + 140 * -Math.cos(radial.rotation), radial.anchor = new PIXI.Point(.5, 1), radial.visible = !1, this.addChild(radial), this._radials.push(radial);
                this._emitterHolder = new PIXI.Container, this._emitterHolder.x = .5 * Common.STAGE_WIDTH, this._emitterHolder.y = .5 * Common.STAGE_HEIGHT, this.addChild(this._emitterHolder);
                var config = Common.assets.getJSON("preloader_radial_spray");
                this._emitter = new cloudkid.Emitter(this._emitterHolder, [Common.assets.getTexture("particle_001"), Common.assets.getTexture("particle_002"), Common.assets.getTexture("particle_003"), Common.assets.getTexture("particle_004"), Common.assets.getTexture("particle_005"), Common.assets.getTexture("particle_006"), Common.assets.getTexture("particle_007")], config), this._emitter.emit = !1;
                var holder = new PIXI.Container;
                holder.x = .5 * Common.STAGE_WIDTH, holder.y = .5 * Common.STAGE_HEIGHT, this.addChild(holder), DistortionEffect.shake(holder), this._spinnerBlack = new PIXI.Sprite(Common.assets.getTexture("preloader_ring_black")), this._spinnerBlack.anchor = new PIXI.Point(.5, .5), this._spinnerBlack.visible = !1, holder.addChild(this._spinnerBlack), this._spinnerCenter = new PIXI.Sprite(Common.assets.getTexture("preloader_ring_centre")), this._spinnerCenter.anchor = new PIXI.Point(.5, .5), this._spinnerCenter.visible = !1, holder.addChild(this._spinnerCenter), this._spinnerWhite = new PIXI.Sprite(Common.assets.getTexture("preloader_ring_white")), this._spinnerWhite.anchor = new PIXI.Point(.5, .5), this._spinnerWhite.visible = !1, holder.addChild(this._spinnerWhite)
            }, PreloaderScene.prototype.destroy = function() {
                for (var tween, i = 0; i < this._tweens.length; ++i) tween = this._tweens[i], tween.kill();
                this._tweens.length = 0, p3.Scene.prototype.destroy.call(this)
            }, PreloaderScene.prototype.appear = function() {
                this.animateIn(), Common.audio.playSound("sfx_omnitrix_open_00")
            }, PreloaderScene.prototype.show = function() {}, PreloaderScene.prototype.animateIn = function(callback, scope) {
                this._emitter.emit = !0, this._spinnerBlack.scale = new PIXI.Point, this._spinnerBlack.visible = !0, this._tweens.push(TweenMax.to(this._spinnerBlack.scale, .4, {
                    x: 1,
                    y: 1,
                    ease: Power2.easeOut,
                    easeParams: [2]
                })), this._spinnerCenter.scale = new PIXI.Point, this._spinnerCenter.visible = !0, this._tweens.push(TweenMax.to(this._spinnerCenter.scale, .4, {
                    delay: .06,
                    x: 1,
                    y: 1,
                    ease: Power2.easeOut,
                    easeParams: [2]
                })), this._spinnerWhite.scale = new PIXI.Point, this._spinnerWhite.visible = !0, this._tweens.push(TweenMax.to(this._spinnerWhite.scale, .46, {
                    delay: .08,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [4]
                })), this._tweens.push(TweenMax.to(this._spinnerCenter.scale, 1.4, {
                    delay: .6,
                    x: .94,
                    y: .94,
                    ease: Back.easeOut,
                    yoyo: !0,
                    repeat: -1
                })), this._tweens.push(TweenMax.to(this._spinnerBlack, 8, {
                    delay: .2,
                    rotation: 8 * Math.PI,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                })), this._tweens.push(TweenMax.to(this._spinnerWhite, 6, {
                    delay: .24,
                    rotation: 8 * -Math.PI,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                }));
                for (var radial, i = 0; i < this._radials.length; ++i) radial = this._radials[i], radial.visible = !0, radial.scale.y = 0, this._tweens.push(TweenMax.to(radial.scale, .8, {
                    delay: .14 + .2 * Math.random(),
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2 * Math.random()],
                    onComplete: function(radial) {
                        this._tweens.push(TweenMax.to(radial.scale, 1.6 + .4 * Math.random(), {
                            delay: .94 * Math.random(),
                            y: .9,
                            ease: Power1.easeInOut,
                            yoyo: !0,
                            repeat: -1
                        }))
                    },
                    onCompleteParams: [radial],
                    onCompleteScope: this
                }))
            }, PreloaderScene.prototype.animateOut = function(callback, scope) {}, PreloaderScene.prototype.resize = function() {
                this.x = .5 * (p3.View.width - Common.STAGE_WIDTH)
            }, PreloaderScene.prototype.update = function() {
                this._emitter.update(p3.Timestep.deltaTime)
            }
        }, {
            "./Common": 25,
            "./DistortionEffect": 27
        }],
        58: [function(require, module, exports) {
            "use strict";

            function ResultScene(score, victory) {
                this._score = score || 0, this._victory = victory, this._titleText = null, this._scoreText = null, this._highscoreText = null, this._homeButton = null, this._soundButton = null, this._nextButton = null, this._spinnerRing = null, this._spinnerInner = null, this._spinnerOuter = null, this._tweens = [], p3.Scene.call(this)
            }
            var AudioParams = require("./AudioParams"),
                BenButton = require("./BenButton"),
                BenMuteButton = require("./BenMuteButton"),
                Common = require("./Common"),
                DistortionEffect = require("./DistortionEffect"),
                Input = require("./Input"),
                PreloaderScene = require("./PreloaderScene");
            module.exports = ResultScene, ResultScene.prototype = Object.create(p3.Scene.prototype), ResultScene.prototype.constructor = ResultScene, ResultScene.prototype.preloader = function() {
                return new PreloaderScene
            }, ResultScene.prototype.load = function() {
                return [{
                    name: "end_game_bg",
                    url: "images/end_game_bg.jpg"
                }]
            }, ResultScene.prototype.unload = function() {
                var assets = Common.assets;
                assets.unloadTexture("end_game_bg", "jpg")
            }, ResultScene.prototype.init = function() {
                var bg = new PIXI.Sprite(Common.assets.getTexture("end_game_bg"));
                this.addChild(bg);
                var holder = new PIXI.Container;
                holder.x = .5 * Common.STAGE_WIDTH + 160, holder.y = .5 * Common.STAGE_HEIGHT, this.addChild(holder), DistortionEffect.shake(holder), this._spinnerRing = new PIXI.Sprite(Common.assets.getTexture("end_game_panel_003")), this._spinnerRing.anchor = new PIXI.Point(.5, .5), this._spinnerRing.visible = !1, holder.addChild(this._spinnerRing), this._spinnerOuter = new PIXI.Sprite(Common.assets.getTexture("end_game_panel_002")), this._spinnerOuter.anchor = new PIXI.Point(.5, .5), this._spinnerOuter.visible = !1, holder.addChild(this._spinnerOuter), this._spinnerInner = new PIXI.Sprite(Common.assets.getTexture("end_game_panel_001")), this._spinnerInner.anchor = new PIXI.Point(.5, .5), this._spinnerInner.visible = !1, holder.addChild(this._spinnerInner);
                var texture = Common.currentLevel % 2 ? Common.assets.getTexture("end_game_char_stinkfly") : Common.assets.getTexture("end_game_char_heatblast");
                this._character = new PIXI.Sprite(texture), this._character.x = .5 * Common.STAGE_WIDTH - 580, this._character.y = p3.View.height - this._character.height, this._character.visible = !1, this.addChild(this._character), Common.currentLevel % 2 == 0 && (this._flames = new PIXI.Sprite(Common.assets.getTexture("end_game_char_heatblast_flames")), this._flames.x = 416, this._flames.y = 140, this._flames.anchor = new PIXI.Point(.5, .5), this._flames.visible = !1, this._character.addChild(this._flames));
                var key = this._victory ? "greatwork" : "gameover";
                "ar" != Common.language && "ru" != Common.language ? (this._titleText = new PIXI.extras.BitmapText(Common.copy[key][Common.language], {
                    font: "100px Ahkio Green",
                    align: "center"
                }), this._titleText.x = .5 * (-this._titleText.textWidth + Common.STAGE_WIDTH) + 162, this._titleText.y = -this._titleText.textHeight + 348, this._titleText.visible = !1, this.addChild(this._titleText)) : (this._titleText = new PIXI.Text(Common.copy[key][Common.language], {
                    font: "100px Arial",
                    fill: "#69FF00",
                    stroke: "#044300",
                    strokeThickness: 10,
                    align: "center"
                }), this._titleText.x = .5 * (-this._titleText.width + Common.STAGE_WIDTH) + 162, this._titleText.y = -this._titleText.height + 348, this._titleText.visible = !1, this.addChild(this._titleText)), this._scoreText = new PIXI.extras.BitmapText(this._score.toString(), {
                    font: "90px Ahkio Orange",
                    align: "center"
                }), this._scoreText.x = .5 * (-this._scoreText.textWidth + Common.STAGE_WIDTH) + 162, this._scoreText.y = -this._scoreText.textHeight + 444, this._scoreText.visible = !1, this.addChild(this._scoreText), "ar" != Common.language && "ru" != Common.language ? (this._highscoreText = new PIXI.extras.BitmapText(Common.copy.highscore[Common.language].replace("[SCORE]", Common.getHighscore()), {
                    font: "60px Ahkio White",
                    align: "center"
                }), this._highscoreText.x = .5 * (-this._highscoreText.textWidth + Common.STAGE_WIDTH) + 162, this._highscoreText.y = 466, this._highscoreText.visible = !1, this.addChild(this._highscoreText)) : (this._highscoreText = new PIXI.Text(Common.copy.highscore[Common.language].replace("[SCORE]", Common.getHighscore()), {
                    font: "60px Arial",
                    fill: "#FFFFFF",
                    stroke: "#044300",
                    strokeThickness: 10,
                    align: "center"
                }), this._highscoreText.x = .5 * (-this._highscoreText.width + Common.STAGE_WIDTH) + 162, this._highscoreText.y = 466, this._highscoreText.visible = !1, this.addChild(this._highscoreText));
                var states = new p3.ButtonStates;
                states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_home_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_home_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._homeButton = new BenButton(states), this._homeButton.y = 80, this._homeButton.animate = !0, this._homeButton.visible = !1, this._homeButton.overSoundName = "sfx_btn_rollover_00", this._homeButton.clickSoundName = "sfx_btn_back", this._homeButton.signals.click.add(this.onHomeButtonClick, this), this.addChild(this._homeButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"),
                    states.icon = Common.assets.getTexture("btn_tertuary_icon_audio_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_audio_over"), states.iconAlt = Common.assets.getTexture("btn_tertuary_icon_mute_off"), states.iconOverAlt = Common.assets.getTexture("btn_tertuary_icon_mute_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._soundButton = new BenMuteButton(states), this._soundButton.y = 80, this._soundButton.animate = !0, this._soundButton.visible = !1, this._soundButton.overSoundName = "sfx_btn_rollover_00", this._soundButton.clickSoundName = "sfx_btn_press_00", this.addChild(this._soundButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_primary_medium_off"), states.over = Common.assets.getTexture("btn_primary_medium_over"), states.icon = Common.assets.getTexture("btn_primary_medium_icon_replay_off"), states.iconOver = Common.assets.getTexture("btn_primary_medium_icon_replay_over"), states.innerRing = Common.assets.getTexture("btn_primary_medium_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_primary_medium_off_ring_001"), this._replayButton = new BenButton(states), this._replayButton.y = p3.View.height - 80, this._replayButton.animate = !0, this._replayButton.visible = !1, this._replayButton.overSoundName = "sfx_btn_rollover_00", this._replayButton.clickSoundName = "sfx_btn_play_00", this._replayButton.signals.click.add(this.onReplayButtonClick, this), this.addChild(this._replayButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_primary_medium_off"), states.over = Common.assets.getTexture("btn_primary_medium_over"), states.icon = Common.assets.getTexture("btn_primary_medium_icon_next_off"), states.iconOver = Common.assets.getTexture("btn_primary_medium_icon_next_over"), states.innerRing = Common.assets.getTexture("btn_primary_medium_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_primary_medium_off_ring_001"), this._nextButton = new BenButton(states), this._nextButton.y = p3.View.height - 80, this._nextButton.animate = !0, this._nextButton.visible = !1, this._nextButton.overSoundName = "sfx_btn_rollover_00", this._nextButton.clickSoundName = "sfx_btn_play_00", this._nextButton.signals.click.add(this.onNextButtonClick, this), this.addChild(this._nextButton), p3.Scene.prototype.init.call(this)
            }, ResultScene.prototype.destroy = function() {
                Common.input.signals.keyUp.remove(this.onKeyUp, this);
                for (var tween, i = 0; i < this._tweens.length; ++i) tween = this._tweens[i], tween.kill();
                this._tweens.length = 0, this._homeButton.destroy(), this._soundButton.destroy(), this._replayButton.destroy(), this._nextButton.destroy(), p3.Scene.prototype.destroy.call(this)
            }, ResultScene.prototype.resize = function() {
                this.x = .5 * (p3.View.width - Common.STAGE_WIDTH), this._homeButton.x = .5 * (Common.STAGE_WIDTH - p3.View.width) + 80, this._soundButton.x = .5 * (Common.STAGE_WIDTH + p3.View.width) - 80, this._replayButton.x = .5 * (Common.STAGE_WIDTH - p3.View.width) + 80, this._nextButton.x = .5 * (Common.STAGE_WIDTH + p3.View.width) - 80
            }, ResultScene.prototype.appear = function() {
                p3.Scene.prototype.appear.call(this), Common.input.signals.keyUp.add(this.onKeyUp, this), delay(function() {
                    this._victory ? Common.audio.playSound(["vo_ben_win_haaa_00", "vo_ben_woohoo_00"]) : Common.audio.playSound("vo_ben_surprise_00")
                }, 1.6, this);
                var params = new AudioParams;
                params.fadeIn = 1, Common.audio.playMusic("music_end_quiet_00", params)
            }, ResultScene.prototype.animateIn = function(callback, scope) {
                this._spinnerRing.scale = new PIXI.Point, this._spinnerRing.visible = !0, this._tweens.push(TweenMax.to(this._spinnerRing.scale, .4, {
                    x: 1,
                    y: 1,
                    ease: Power2.easeOut,
                    easeParams: [2],
                    onStart: function() {
                        this._victory ? Common.audio.playSound("sfx_enemy_fire_00") : Common.audio.playSound("sfx_drone_shutdown_00")
                    },
                    onStartScope: this
                })), this._spinnerInner.scale = new PIXI.Point, this._spinnerInner.visible = !0, this._tweens.push(TweenMax.to(this._spinnerInner.scale, .4, {
                    delay: .06,
                    x: 1,
                    y: 1,
                    ease: Power2.easeOut,
                    easeParams: [2]
                })), this._spinnerOuter.scale = new PIXI.Point, this._spinnerOuter.visible = !0, this._tweens.push(TweenMax.to(this._spinnerOuter.scale, .46, {
                    delay: .08,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [4]
                })), this._tweens.push(TweenMax.to(this._spinnerRing, 8, {
                    delay: .2,
                    rotation: 4 * Math.PI,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                })), this._tweens.push(TweenMax.to(this._spinnerInner, 10, {
                    delay: .22,
                    rotation: 2 * Math.PI,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                })), this._tweens.push(TweenMax.to(this._spinnerOuter, 6, {
                    delay: .24,
                    rotation: 4 * -Math.PI,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                })), this._titleText.alpha = 0, this._titleText.visible = !0, this._tweens.push(TweenMax.to(this._titleText, .4, {
                    delay: .34,
                    alpha: 1,
                    ease: Power1.easeInOut
                })), this._scoreText.alpha = 0, this._scoreText.visible = !0, this._tweens.push(TweenMax.to(this._scoreText, .4, {
                    delay: .34,
                    alpha: 1,
                    ease: Power1.easeInOut
                })), this._highscoreText.alpha = 0, this._highscoreText.visible = !0, this._tweens.push(TweenMax.to(this._highscoreText, .4, {
                    delay: .34,
                    alpha: 1,
                    ease: Power1.easeInOut
                }));
                var tx = this._character.x;
                this._character.x = this._character.x - 400, this._character.alpha = 0, this._character.visible = !0, this._tweens.push(TweenMax.to(this._character, .4, {
                    delay: .4,
                    x: tx,
                    alpha: 1,
                    ease: Power1.easeOut
                })), this._flames && (this._flames.scale = new PIXI.Point, this._flames.visible = !0, this._tweens.push(TweenMax.to(this._flames.scale, .4, {
                    delay: .8,
                    x: 1,
                    y: 1,
                    ease: Power2.easeInOut
                })), this._tweens.push(TweenMax.to(this._flames, 1, {
                    y: this._flames.y - 34,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                }))), this._homeButton.scale = new PIXI.Point, this._homeButton.visible = !0, this._tweens.push(TweenMax.to(this._homeButton.scale, .4, {
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2]
                })), this._soundButton.scale = new PIXI.Point, this._soundButton.visible = !0, this._tweens.push(TweenMax.to(this._soundButton.scale, .4, {
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2]
                })), this._replayButton.scale = new PIXI.Point, this._replayButton.visible = !0, this._tweens.push(TweenMax.to(this._replayButton.scale, .4, {
                    delay: .2,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2]
                })), this._victory && (this._nextButton.scale = new PIXI.Point, this._nextButton.visible = !0, this._tweens.push(TweenMax.to(this._nextButton.scale, .4, {
                    delay: .2,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2]
                })))
            }, ResultScene.prototype.update = function() {
                this._flames && (this._flames.rotation -= .064)
            }, ResultScene.prototype.onHomeButtonClick = function(button) {
                this.signals.home.dispatch(this)
            }, ResultScene.prototype.onReplayButtonClick = function() {
                this.signals.previous.dispatch(this)
            }, ResultScene.prototype.onNextButtonClick = function(button) {
                this.signals.next.dispatch(this)
            }, ResultScene.prototype.onKeyUp = function(event) {
                event.keyCode == Input.keys.ENTER && (this._victory ? this.onNextButtonClick(null) : this.onReplayButtonClick(null))
            }
        }, {
            "./AudioParams": 9,
            "./BenButton": 12,
            "./BenMuteButton": 13,
            "./Common": 25,
            "./DistortionEffect": 27,
            "./Input": 47,
            "./PreloaderScene": 57
        }],
        59: [function(require, module, exports) {
            "use strict";

            function Shockwave(view, texture, push) {
                if (this._view = view, this._filter = null, PIXI.Sprite.call(this, texture), this.anchor = new PIXI.Point(.5, .5), this._filter = new PIXI.filters.DisplacementFilter(this), this._view.filters) {
                    var filters = this._view.filters;
                    push ? filters.push(this._filter) : filters.unshift(this._filter), this._view.filters = filters
                } else this._view.filters = [this._filter]
            }
            require("./Common");
            module.exports = Shockwave, Shockwave.prototype = Object.create(PIXI.Sprite.prototype), Shockwave.prototype.constructor = Shockwave, Shockwave.prototype.destroy = function() {
                var filters = this._view.filters;
                if (filters) {
                    var index = filters.indexOf(this._filter);
                    index != -1 && (filters.length > 1 ? filters.splice(index, 1) : filters = null), this._view.filters = filters
                }
                this.parent && this.parent.removeChild(this), PIXI.Sprite.prototype.destroy.call(this)
            }, Shockwave.prototype.animate = function(duration) {
                duration = duration || 1.4;
                var tl = new TimelineMax({
                    onComplete: this.destroy,
                    onCompleteScope: this
                });
                this.scale.x = .01, this.scale.y = .01, tl.insert(TweenMax.to(this.scale, duration, {
                    x: 1.4,
                    y: 1.4,
                    ease: Power1.easeOut
                })), tl.insert(TweenMax.to(this.filter.scale, .3 * duration, {
                    delay: duration - .3 * duration,
                    x: .1,
                    y: .1,
                    ease: Power1.easeInOut
                }))
            }, Object.defineProperty(Shockwave.prototype, "view", {
                get: function() {
                    return this._view
                }
            }), Object.defineProperty(Shockwave.prototype, "filter", {
                get: function() {
                    return this._filter
                }
            })
        }, {
            "./Common": 25
        }],
        60: [function(require, module, exports) {
            "use strict";

            function ShockwaveBomb(owner) {
                Bomb.call(this, owner)
            }
            var Bomb = require("./Bomb"),
                Common = require("./Common");
            require("./Shockwave");
            module.exports = ShockwaveBomb, ShockwaveBomb.prototype = Object.create(Bomb.prototype), ShockwaveBomb.prototype.constructor = ShockwaveBomb, ShockwaveBomb.prototype.activate = function(parent, position, targets) {
                for (var target, i = 0; i < targets.length; ++i) target = targets[i], target.takeDamage(Number.MAX_VALUE);
                var wave = new PIXI.Sprite(Common.assets.getTexture("projectile_bomb_ben"));
                wave.x = position.x, wave.y = position.y, wave.rotation = Math.random() * (2 * Math.PI), wave.scale = new PIXI.Point(.8, .8), wave.anchor = new PIXI.Point(.5, .5), parent.addChild(wave), TweenMax.to(wave.scale, .34, {
                    x: 1.6,
                    y: 1.6,
                    ease: Power2.easeOut,
                    onUpdate: function(wave) {
                        wave.x = Common.player.x, wave.y = Common.player.y - 28
                    },
                    onUpdateParams: [wave],
                    onUpdateScope: this
                }), TweenMax.to(wave, .34, {
                    delay: .1,
                    alpha: 0,
                    ease: Power1.easeInOut,
                    onComplete: function() {
                        wave.parent.removeChild(wave)
                    },
                    onCompleteScope: this
                }), Common.audio.playSound("sfx_enemy_fire_00"), Bomb.prototype.activate.call(this)
            }
        }, {
            "./Bomb": 14,
            "./Common": 25,
            "./Shockwave": 59
        }],
        61: [function(require, module, exports) {
            "use strict";

            function Spawner(camera) {
                this.signals = {}, this.signals.spawn = new signals.Signal, this._groups = []
            }
            var SpawnerCreep = (require("./Common"), require("./SpawnerCreep")),
                SpawnerGroup = require("./SpawnerGroup");
            module.exports = Spawner, Spawner.prototype.parseLevel = function(data) {
                var g, group, c, creep, creeps, i, j, groups = data.groups;
                for (i = 0; i < groups.length; ++i)
                    for (g = groups[i], group = new SpawnerGroup, group.position.x = g.x, group.position.y = g.y, group.delay = g.delay, group.chance = g.chance, group.powerup = g.powerup, this._groups.push(group), creeps = g.creeps, j = 0; j < creeps.length; ++j) c = creeps[j], creep = new SpawnerCreep(group), creep.type = c.type, creep.position.x = group.position.x + c.x, creep.position.y = group.position.y + c.y, creep.delay = group.delay + c.delay, creep.path = c.path, group.creeps.push(creep)
            }, Spawner.prototype.addGroup = function(group) {
                this._groups.push(group)
            }, Spawner.prototype.spawn = function(creep) {
                creep.delay > 0 ? delay(function() {
                    this.signals.spawn.dispatch(creep)
                }, creep.delay, this) : this.signals.spawn.dispatch(creep)
            }, Spawner.prototype.update = function(x) {
                var group, creep, i, j;
                for (i = 0; i < this._groups.length; ++i)
                    if (group = this._groups[i], group.active && x >= group.position.x && (group.active = !1, Math.random() < group.chance))
                        for (j = 0; j < group.creeps.length; ++j) creep = group.creeps[j], this.spawn(creep)
            }
        }, {
            "./Common": 25,
            "./SpawnerCreep": 62,
            "./SpawnerGroup": 63
        }],
        62: [function(require, module, exports) {
            "use strict";

            function SpawnerCreep(group) {
                this.type = 0, this.position = new PIXI.Point, this.delay = 0, this.path = null, this.group = group
            }
            module.exports = SpawnerCreep
        }, {}],
        63: [function(require, module, exports) {
            "use strict";

            function SpawnerGroup() {
                this.position = new PIXI.Point, this.delay = 0, this.chance = 1, this.creeps = [], this.powerup = -1, this.killed = 0, this.active = !0
            }
            module.exports = SpawnerGroup
        }, {}],
        64: [function(require, module, exports) {
            "use strict";

            function SplashScene() {
                p3.Scene.call(this), this._omni = null, this._ben = null, this._drone1 = null, this._drone2 = null, this._drone3 = null, this._drone4 = null, this._drone5 = null, this._playButton = null, this._soundButton = null, this._animator = null
            }
            var AudioParams = require("./AudioParams"),
                BenMuteButton = (require("./BenButton"), require("./BenMuteButton")),
                Common = require("./Common"),
                Input = require("./Input");
            module.exports = SplashScene, SplashScene.prototype = Object.create(p3.Scene.prototype), SplashScene.prototype.constructor = SplashScene, SplashScene.prototype.init = function() {
                this._animator = new p3.Animator;
                var bg = new PIXI.Sprite(Common.assets.getTexture("splash_bg"));
                this.addChild(bg), this._omni = new PIXI.Container, this._omni.x = .5 * Common.STAGE_WIDTH, this._omni.y = .5 * Common.STAGE_HEIGHT + 40, this.addChild(this._omni), this._omni.center = new PIXI.Sprite(Common.assets.getTexture("splash_centre")), this._omni.center.anchor = new PIXI.Point(.5, .5), this._omni.center.visible = !1, this._omni.addChild(this._omni.center), this._omni.inner = new PIXI.Sprite(Common.assets.getTexture("splash_middle")), this._omni.inner.anchor = new PIXI.Point(.5, .5), this._omni.inner.visible = !1, this._omni.addChild(this._omni.inner), this._omni.outer = new PIXI.Sprite(Common.assets.getTexture("splash_outside")), this._omni.outer.anchor = new PIXI.Point(.5, .5), this._omni.outer.visible = !1, this._omni.addChild(this._omni.outer), this._omni.heatblast = new PIXI.Sprite(Common.assets.getTexture("splash_heatblast")), this._omni.heatblast.x = 8, this._omni.heatblast.y = -280, this._omni.heatblast.anchor = new PIXI.Point(1, .5), this._omni.heatblast.visible = !1, this._omni.addChild(this._omni.heatblast), this._omni.stinkfly = new PIXI.Sprite(Common.assets.getTexture("splash_stinkfly")), this._omni.stinkfly.x = 74, this._omni.stinkfly.y = -328, this._omni.stinkfly.anchor = new PIXI.Point(0, .5), this._omni.stinkfly.visible = !1, this._omni.addChild(this._omni.stinkfly), this._omni.logo = new PIXI.Sprite(Common.assets.getTexture("splash_logo")), this._omni.logo.y = -230, this._omni.logo.anchor = new PIXI.Point(.5, .5), this._omni.logo.visible = !1, this._omni.addChild(this._omni.logo), this._drone1 = new PIXI.Sprite(Common.assets.getTexture("splash_drone_001")), this._drone1.x = .5 * Common.STAGE_WIDTH + 180, this._drone1.y = 328, this._drone1.anchor = new PIXI.Point(.5, .5), this._drone1.visible = !1, this.addChild(this._drone1), this._drone2 = new PIXI.Sprite(Common.assets.getTexture("splash_drone_002")), this._drone2.x = .5 * Common.STAGE_WIDTH + 190, this._drone2.y = 534, this._drone2.anchor = new PIXI.Point(.5, .5), this._drone2.visible = !1, this.addChild(this._drone2), this._drone3 = new PIXI.Sprite(Common.assets.getTexture("splash_drone_003")), this._drone3.x = .5 * Common.STAGE_WIDTH + 374, this._drone3.y = 498, this._drone3.visible = !1, this.addChild(this._drone3), this._drone4 = new PIXI.Sprite(Common.assets.getTexture("splash_drone_004")), this._drone4.x = .5 * Common.STAGE_WIDTH + 384, this._drone4.y = 328, this._drone4.visible = !1, this.addChild(this._drone4), this._drone5 = new PIXI.Sprite(Common.assets.getTexture("splash_drone_005")), this._drone5.x = .5 * Common.STAGE_WIDTH + 290, this._drone5.y = 674, this._drone5.visible = !1, this.addChild(this._drone5), this._omni.title = new p3.AdditiveSprite(Common.assets.getTexture("title")), this._omni.title.y = -12, this._omni.title.anchor = new PIXI.Point(.5, .5), this._omni.title.visible = !1, this._omni.addChild(this._omni.title), this._ben = new PIXI.Sprite(Common.assets.getTexture("splash_ben")), this._ben.x = .5 * Common.STAGE_WIDTH - 520, this._ben.y = 240, this._ben.visible = !1, this.addChild(this._ben);
                var states = new p3.ButtonStates;
                states.normal = Common.assets.getTexture("btn_play_off"), states.over = Common.assets.getTexture("btn_play_over"), states.icon = Common.assets.getTexture("btn_play_icon_off"), states.iconOver = Common.assets.getTexture("btn_play_icon_over"), this._playButton = new p3.Button(states), this._playButton.x = .5 * Common.STAGE_WIDTH, this._playButton.y = 590, this._playButton.animate = !0, this._playButton.overSoundName = "sfx_btn_rollover_00", this._playButton.clickSoundName = "sfx_btn_play_00", this._playButton.visible = !1, this._playButton.signals.click.add(this.onPlayButtonClick, this), this.addChild(this._playButton), states = new p3.ButtonStates, states.normal = Common.assets.getTexture("btn_tertuary_off"), states.over = Common.assets.getTexture("btn_tertuary_over"), states.icon = Common.assets.getTexture("btn_tertuary_icon_audio_off"), states.iconOver = Common.assets.getTexture("btn_tertuary_icon_audio_over"), states.iconAlt = Common.assets.getTexture("btn_tertuary_icon_mute_off"), states.iconOverAlt = Common.assets.getTexture("btn_tertuary_icon_mute_over"), states.innerRing = Common.assets.getTexture("btn_tertuary_off_ring_001"), states.outerRing = Common.assets.getTexture("btn_tertuary_off_ring_002"), this._soundButton = new BenMuteButton(states), this._soundButton.y = 80, this._soundButton.animate = !0, this._soundButton.overSoundName = "sfx_btn_rollover_00", this._soundButton.clickSoundName = "sfx_btn_press_00", this.addChild(this._soundButton), p3.Scene.prototype.init.call(this)
            }, SplashScene.prototype.destroy = function() {
                Common.input.signals.keyUp.remove(this.onKeyUp, this), this._animator.removeAll(), this._playButton.destroy(), this._soundButton.destroy(), p3.Scene.prototype.destroy.call(this)
            }, SplashScene.prototype.resize = function() {
                this.x = .5 * (p3.View.width - Common.STAGE_WIDTH), this._soundButton.x = .5 * (Common.STAGE_WIDTH + p3.View.width) - 80
            }, SplashScene.prototype.appear = function() {
                p3.Scene.prototype.appear.call(this), Common.input.signals.keyUp.add(this.onKeyUp, this);
                var params = new AudioParams;
                params.fadeIn = 1, Common.audio.playMusic("music_main_fullloop_quiet_00", params)
            }, SplashScene.prototype.animateIn = function(callback, scope) {
                this._omni.logo.scale = new PIXI.Point, this._omni.logo.visible = !0, this._animator.add(TweenMax.to(this._omni.logo.scale, .34, {
                    delay: .2,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2],
                    onStart: function() {
                        Common.audio.playSound("sfx_enemy_fire_00")
                    }
                })), this._playButton.scale = new PIXI.Point, this._playButton.visible = !0, this._animator.add(TweenMax.to(this._playButton.scale, .4, {
                    delay: .2 + .1,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2]
                })), this._omni.title.scale = new PIXI.Point, this._omni.title.visible = !0, this._animator.add(TweenMax.to(this._omni.title.scale, .34, {
                    delay: .5,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    params: [6]
                })), this._omni.title.blendStrength = 1, this._animator.add(TweenMax.to(this._omni.title, .24, {
                    delay: .56,
                    blendStrength: 0,
                    ease: Power2.easeOut
                })), this._omni.inner.scale = new PIXI.Point, this._omni.inner.visible = !0, this._animator.add(TweenMax.to(this._omni.inner.scale, .4, {
                    delay: .32,
                    x: 1,
                    y: 1,
                    ease: Power2.easeOut,
                    easeParams: [2]
                })), this._omni.center.scale = new PIXI.Point, this._omni.center.visible = !0, this._animator.add(TweenMax.to(this._omni.center.scale, .4, {
                    delay: .38,
                    x: 1,
                    y: 1,
                    ease: Power2.easeOut,
                    easeParams: [2]
                })), this._omni.outer.scale = new PIXI.Point, this._omni.outer.visible = !0, this._animator.add(TweenMax.to(this._omni.outer.scale, .46, {
                    delay: .4,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [4]
                })), this._animator.add(TweenMax.to(this._omni.center.scale, 1.4, {
                    delay: .32 + .6,
                    x: .94,
                    y: .94,
                    ease: Back.easeOut,
                    yoyo: !0,
                    repeat: -1
                })), this._animator.add(TweenMax.to(this._omni.inner, 8, {
                    delay: .52,
                    rotation: 4 * Math.PI,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                })), this._animator.add(TweenMax.to(this._omni.outer, 6, {
                    delay: .56,
                    rotation: 4 * -Math.PI,
                    ease: Power1.easeInOut,
                    yoyo: !0,
                    repeat: -1
                }));
                var to = new PIXI.Point(this._ben.x, this._ben.y);
                this._ben.y = p3.View.height, this._ben.visible = !0, this._animator.add(TweenMax.to(this._ben, .52, {
                    delay: .58,
                    y: to.y,
                    ease: Power2.easeOut,
                    onStart: function() {
                        Common.audio.playSound("vo_ben_win_haaa_00")
                    }
                })), this._drone1.scale = new PIXI.Point, this._drone1.visible = !0, this._animator.add(TweenMax.to(this._drone1.scale, .4, {
                    delay: 1.1,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [1]
                })), this._drone2.scale = new PIXI.Point, this._drone2.visible = !0, this._animator.add(TweenMax.to(this._drone2.scale, .4, {
                    delay: 1.34,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [1]
                })), to = new PIXI.Point(this._drone3.x, this._drone3.y), this._drone3.x = this._omni.x, this._drone3.y = this._omni.y, this._drone3.anchor = new PIXI.Point(.5, .5), this._drone3.scale = new PIXI.Point, this._drone3.visible = !0, this._animator.add(TweenMax.to(this._drone3, .68, {
                    delay: .94,
                    ease: Power2.easeOut,
                    bezier: [{
                        x: this._omni.x + 160,
                        y: this._omni.y + 4
                    }, {
                        x: to.x,
                        y: to.y
                    }]
                })), this._animator.add(TweenMax.to(this._drone3.scale, .68, {
                    delay: .94,
                    x: 1,
                    y: 1,
                    ease: Power1.easeOut
                })), to = new PIXI.Point(this._drone4.x, this._drone4.y), this._drone4.x = this._omni.x, this._drone4.y = this._omni.y, this._drone4.anchor = new PIXI.Point(.5, .5), this._drone4.scale = new PIXI.Point, this._drone4.visible = !0, this._animator.add(TweenMax.to(this._drone4, .64, {
                    delay: .6,
                    ease: Power2.easeOut,
                    bezier: [{
                        x: this._omni.x + 160,
                        y: this._omni.y + 24
                    }, {
                        x: to.x,
                        y: to.y
                    }]
                })), this._animator.add(TweenMax.to(this._drone4.scale, .64, {
                    delay: .6,
                    x: 1,
                    y: 1,
                    ease: Power1.easeOut
                })), to = new PIXI.Point(this._drone5.x, this._drone5.y), this._drone5.x = this._omni.x, this._drone5.y = this._omni.y, this._drone5.anchor = new PIXI.Point(.5, .5), this._drone5.scale = new PIXI.Point, this._drone5.visible = !0, this._animator.add(TweenMax.to(this._drone5, .74, {
                    delay: .84,
                    ease: Power2.easeOut,
                    bezier: [{
                        x: this._omni.x + 160,
                        y: this._omni.y + 42
                    }, {
                        x: to.x,
                        y: to.y
                    }]
                })), this._animator.add(TweenMax.to(this._drone5.scale, .74, {
                    delay: .84,
                    x: 1,
                    y: 1,
                    ease: Power1.easeOut
                })), this._omni.heatblast.scale = new PIXI.Point, this._omni.heatblast.visible = !0, this._animator.add(TweenMax.to(this._omni.heatblast.scale, .46, {
                    delay: .84,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [1]
                })), this._omni.stinkfly.scale = new PIXI.Point, this._omni.stinkfly.visible = !0, this._animator.add(TweenMax.to(this._omni.stinkfly.scale, .46, {
                    delay: .84,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [1]
                }))
            }, SplashScene.prototype.animateOut = function(callback, scope) {}, SplashScene.prototype.update = function() {
                this._animator.update(p3.Timestep.deltaTime)
            }, SplashScene.prototype.onPlayButtonClick = function(button) {
                this.signals.next.dispatch(this)
            }, SplashScene.prototype.onKeyUp = function(event) {
                event.keyCode == Input.keys.ENTER && this.onPlayButtonClick(null)
            }
        }, {
            "./AudioParams": 9,
            "./BenButton": 12,
            "./BenMuteButton": 13,
            "./Common": 25,
            "./Input": 47
        }],
        65: [function(require, module, exports) {
            "use strict";

            function Stinkfly1() {
                Player.call(this), this.speed = 2740;
                var holder = new PIXI.Container;
                holder.x = 6, holder.y = 30, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("stinkfly")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine), this.fireRate = .26, this.fireOffset = new PIXI.Point(24, (-20)), this.aabb = new PIXI.Rectangle((-72), (-96), 144, 144), this._loopSFX = null
            }
            var AudioParams = (require("./Actor"), require("./AudioParams")),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Player = require("./Player");
            require("./TrailRenderer");
            module.exports = Stinkfly1, Stinkfly1.prototype = Object.create(Player.prototype), Stinkfly1.prototype.constructor = Stinkfly1, Stinkfly1.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_001", !0);
                var params = new AudioParams;
                params.loop = !0, this._loopSFX = Common.audio.playSound("sfx_stinkfly_flap_00", params)
            }, Stinkfly1.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), Player.prototype.destroy.call(this)
            }, Stinkfly1.prototype.update = function() {
                Player.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, Stinkfly1.prototype.fire = function() {
                this._fireTime = this.fireRate;
                var type = BulletTypes.GOO_BALL1,
                    position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y),
                    rotation = 0,
                    direction = new p3.Vector2(1, 0);
                this.signals.fire.dispatch(type, this, position, rotation, direction, !1), Common.audio.playSound("sfx_stinkfly_shoot_02")
            }
        }, {
            "./Actor": 5,
            "./AudioParams": 9,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54,
            "./TrailRenderer": 68
        }],
        66: [function(require, module, exports) {
            "use strict";

            function Stinkfly2() {
                Player.call(this), this.speed = 2800;
                var holder = new PIXI.Container;
                holder.x = 6, holder.y = 30, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("stinkfly")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine), this.fireRate = .26, this.fireOffset = new PIXI.Point(24, (-20)), this.aabb = new PIXI.Rectangle((-72), (-96), 144, 144), this._loopSFX = null
            }
            var AudioParams = (require("./Actor"), require("./AudioParams")),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Player = require("./Player");
            module.exports = Stinkfly2, Stinkfly2.prototype = Object.create(Player.prototype), Stinkfly2.prototype.constructor = Stinkfly2, Stinkfly2.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_002", !0);
                var params = new AudioParams;
                params.loop = !0, this._loopSFX = Common.audio.playSound("sfx_stinkfly_flap_00", params)
            }, Stinkfly2.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), Player.prototype.destroy.call(this)
            }, Stinkfly2.prototype.update = function() {
                Player.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, Stinkfly2.prototype.fire = function() {
                this._fireTime = this.fireRate;
                for (var type, position, rotation, direction, count = 3, spacing = .4 / count, i = 0; i < count; ++i) type = BulletTypes.GOO_BALL2, position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y), rotation = spacing * i - spacing * (count - 1) * .5, direction = new p3.Vector2(Math.cos(rotation), Math.sin(rotation)), this.signals.fire.dispatch(type, this, position, rotation, direction, !1);
                Common.audio.playSound("sfx_stinkfly_gasattack_01")
            }
        }, {
            "./Actor": 5,
            "./AudioParams": 9,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54
        }],
        67: [function(require, module, exports) {
            "use strict";

            function Stinkfly3() {
                Player.call(this), this.speed = 2860;
                var holder = new PIXI.Container;
                holder.x = 6, holder.y = 20, this.addChild(holder), this.spine = new PIXI.spine.Spine(Common.assets.getSpineData("stinkfly")), this.spine.skeleton.setToSetupPose(), this.spine.skeleton.setSkin(null), this.spine.autoUpdate = !1, this.spine.scale.set(.5), holder.addChild(this.spine), this.fireRate = .26, this.fireOffset = new PIXI.Point(24, (-20)), this.aabb = new PIXI.Rectangle((-72), (-96), 144, 144), this._loopSFX = null
            }
            var AudioParams = (require("./Actor"), require("./AudioParams")),
                BulletTypes = require("./BulletTypes"),
                Common = require("./Common"),
                Player = require("./Player");
            module.exports = Stinkfly3, Stinkfly3.prototype = Object.create(Player.prototype), Stinkfly3.prototype.constructor = Stinkfly3, Stinkfly3.prototype.init = function() {
                Player.prototype.init.call(this), this.spine.state.setAnimationByName(0, "idle_003", !0);
                var params = new AudioParams;
                params.loop = !0, this._loopSFX = Common.audio.playSound("sfx_stinkfly_flap_00", params)
            }, Stinkfly3.prototype.destroy = function() {
                this._loopSFX && (this._loopSFX.stop(), this._loopSFX = null), Player.prototype.destroy.call(this)
            }, Stinkfly3.prototype.update = function() {
                Player.prototype.update.call(this), this.spine.update(p3.Timestep.deltaTime)
            }, Stinkfly3.prototype.fire = function() {
                this._fireTime = this.fireRate;
                for (var type, position, rotation, direction, count = 3, spacing = .4 / count, i = 0; i < count; ++i) type = BulletTypes.GOO_BALL3, position = new PIXI.Point(this.x + this.fireOffset.x, this.y + this.fireOffset.y), rotation = spacing * i - spacing * (count - 1) * .5, direction = new p3.Vector2(Math.cos(rotation), Math.sin(rotation)), this.signals.fire.dispatch(type, this, position, rotation, direction, !1);
                Common.audio.playSound("sfx_stinkfly_gasattack_01")
            }
        }, {
            "./Actor": 5,
            "./AudioParams": 9,
            "./BulletTypes": 23,
            "./Common": 25,
            "./Player": 54
        }],
        68: [function(require, module, exports) {
            "use strict";

            function TrailRenderer() {
                this.time = 1, this.vertexDistance = 8, this.thickness = 8, this.color = 16777215, this.enabled = !0, this._vertices = [], PIXI.Graphics.call(this)
            }
            module.exports = TrailRenderer, TrailRenderer.prototype = Object.create(PIXI.Graphics.prototype), TrailRenderer.prototype.constructor = TrailRenderer, TrailRenderer.prototype.destroy = function() {
                PIXI.Graphics.prototype.destroy.call(this)
            }, TrailRenderer.prototype.draw = function(x, y) {
                this.clear();
                for (var vertex, i = this._vertices.length - 1; i >= 0; --i) vertex = this._vertices[i], .001 * window.performance.now() - vertex.time > this.time && this._vertices.splice(i, 1);
                if (this._vertices.length > 1) {
                    for (this.moveTo(this.first.x, this.first.y), this.lineStyle(this.thickness, this.color), i = 1; i < this._vertices.length; ++i) vertex = this._vertices[i], this.lineTo(vertex.x, vertex.y);
                    this.enabled && this.lineTo(x, y)
                }
                if (this.first) {
                    var direction = new p3.Vector2(x - this.last.x, y - this.last.y);
                    direction.lengthSq > this.vertexDistance * this.vertexDistance && this.recordVertex(x, y)
                } else this.recordVertex(x, y)
            }, TrailRenderer.prototype.reset = function() {
                this._vertices.length = 0
            }, TrailRenderer.prototype.recordVertex = function(x, y) {
                if (this.enabled) {
                    var vertex = {
                        x: x,
                        y: y,
                        time: .001 * window.performance.now()
                    };
                    this._vertices.push(vertex)
                }
            }, Object.defineProperty(TrailRenderer.prototype, "first", {
                get: function() {
                    return this._vertices.length ? this._vertices[0] : null
                }
            }), Object.defineProperty(TrailRenderer.prototype, "last", {
                get: function() {
                    return this._vertices.length ? this._vertices[this._vertices.length - 1] : null
                }
            })
        }, {}],
        69: [function(require, module, exports) {
            "use strict";

            function TransformationEffect() {
                PIXI.Container.call(this), this._layer1 = new PIXI.Sprite(Common.assets.getTexture("transform_001")), this._layer1.anchor = new PIXI.Point(.5, .5), this._layer1.visible = !1, this.addChild(this._layer1), this._layer2 = new PIXI.Sprite(Common.assets.getTexture("transform_002")), this._layer2.rotation = Math.random() * (2 * Math.PI), this._layer2.anchor = new PIXI.Point(.5, .5), this._layer2.visible = !1, this.addChild(this._layer2), this._layer3 = new PIXI.Sprite(Common.assets.getTexture("transform_003")), this._layer3.rotation = Math.random() * (2 * Math.PI), this._layer3.anchor = new PIXI.Point(.5, .5), this._layer3.visible = !1, this.addChild(this._layer3), this.on("added", this.init, this)
            }
            var Common = require("./Common");
            module.exports = TransformationEffect, TransformationEffect.prototype = Object.create(PIXI.Container.prototype), TransformationEffect.prototype.constructor = TransformationEffect, TransformationEffect.prototype.init = function() {
                if (!this._emitter) {
                    var config = Common.assets.getJSON("preloader_radial_spray");
                    config.scale.start = .2, config.scale.end = 1, config.lifetime.min = .42, config.lifetime.max = .68, config.emitterLifetime = .8, this._emitter = new cloudkid.Emitter(this.parent, [Common.assets.getTexture("particle_transform_001"), Common.assets.getTexture("particle_transform_002"), Common.assets.getTexture("particle_transform_003"), Common.assets.getTexture("particle_transform_004")], config), this._emitter.emit = !0
                }
            }, TransformationEffect.prototype.animate = function() {
                this._layer1.scale = new PIXI.Point, this._layer1.visible = !0, TweenMax.to(this._layer1.scale, .4, {
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [4]
                }), this._layer2.scale = new PIXI.Point, this._layer2.visible = !0, TweenMax.to(this._layer2.scale, .34, {
                    delay: .14,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [2]
                }), this._layer3.scale = new PIXI.Point, this._layer3.visible = !0, TweenMax.to(this._layer3.scale, .4, {
                    delay: .36,
                    x: 1,
                    y: 1,
                    ease: Back.easeOut,
                    easeParams: [3]
                }), TweenMax.to(this._layer1.scale, .4, {
                    delay: .8,
                    x: 0,
                    y: 0,
                    ease: Back.easeIn,
                    easeParams: [2]
                }), TweenMax.to(this._layer2, .24, {
                    delay: .66,
                    alpha: 0,
                    ease: Power1.easeInOut
                }), TweenMax.to(this._layer2.scale, .4, {
                    delay: .6,
                    x: 0,
                    y: 0,
                    ease: Back.easeIn,
                    easeParams: [2]
                }), TweenMax.to(this._layer3, .24, {
                    delay: .66,
                    alpha: 0,
                    ease: Power1.easeInOut
                }), TweenMax.to(this._layer3.scale, .4, {
                    delay: .6,
                    x: 0,
                    y: 0,
                    ease: Back.easeIn,
                    easeParams: [2]
                })
            }, TransformationEffect.prototype.update = function() {
                this._layer2.rotation += .8 * p3.Timestep.deltaTime, this._layer3.rotation -= 2.2 * p3.Timestep.deltaTime, this._emitter && (this._emitter.updateOwnerPos(this.x, this.y), this._emitter.update(p3.Timestep.deltaTime))
            }
        }, {
            "./Common": 25
        }],
        70: [function(require, module, exports) {
            "use strict";

            function World(camera) {
                PIXI.Container.call(this), this._camera = camera, this._bg = null, this._length = 0, this._game = new PIXI.Container, this.addChild(this._game), this._camera.addLayer("game", this._game, new PIXI.Point(1, 1)), this._layers = {}
            }
            var Common = require("./Common"),
                WorldLayer = require("./WorldLayer");
            module.exports = World, World.prototype = Object.create(PIXI.Container.prototype), World.prototype.constructor = World, World.prototype.parseLevel = function(data) {
                var layers = data.level.layers;
                this._length = data.level.length;
                var i, l, layer, ease, t, tiles, j, tile;
                for (i in layers)
                    if (layers.hasOwnProperty(i))
                        for (l = layers[i], ease = l.ease, l.tiles.sort(function(a, b) {
                                return a.x - b.x
                            }), layer = new WorldLayer, layer.view.zOrder = l.zOrder, this.addChild(layer.view), this._layers[i] = layer, this._camera.addLayer(i, layer.view, new PIXI.Point(ease, 1)), tiles = l.tiles, j = 0; j < tiles.length; ++j) t = tiles[j], tile = new PIXI.Sprite(Common.assets.getTexture(t.texture)), tile.x = Math.floor(t.x), tile.y = Math.floor(t.y), tile.anchor = new PIXI.Point(.5, .5), layer.tiles.push(tile);
                this.children.sort(function(a, b) {
                        var z1 = a.zOrder || 0,
                            z2 = b.zOrder || 0;
                        return z1 - z2
                    }), this._bg = new PIXI.Sprite(Common.assets.getTexture(data.level.background)),
                    this._bg.x = .5 * (p3.View.width - this._bg.width), this._bg.height = p3.View.height, this.addChildAt(this._bg, 0)
            }, World.prototype.sortTiles = function() {
                var i, layer, j, tile, index;
                for (i in this._layers)
                    if (this._layers.hasOwnProperty(i))
                        for (layer = this._layers[i], layer.cells = [], j = 0; j < layer.tiles.length; ++j) {
                            for (tile = layer.tiles[j], index = Math.floor((tile.x - layer.tiles[0].x) / p3.View.width); layer.cells.length - 1 < index;) layer.cells.push([]);
                            layer.cells[index].push(tile)
                        }
            }, World.prototype.repeatTiles = function(layer, start) {
                var tile, cell, i, j, first = layer.tiles[0],
                    last = layer.tiles[layer.tiles.length - 1],
                    count = layer.tiles.length;
                for (i = 0; i < count; ++i) tile = new PIXI.Sprite(layer.tiles[i].texture), tile.x = Math.floor(layer.tiles[i].x - first.x + last.x + last.width), tile.y = Math.floor(layer.tiles[i].y), tile.anchor = new PIXI.Point(.5, .5), layer.tiles.push(tile);
                if (start > 0)
                    for (i = 0; i < start - 1; ++i)
                        for (cell = layer.cells[i], j = count - 1; j >= 0; --j) tile = layer.tiles[j], tile == cell[i] && layer.tiles.splice(j, 1);
                this.sortTiles()
            }, World.prototype.resize = function() {
                this.sortTiles(), this._bg.x = .5 * (p3.View.width - this._bg.width)
            }, World.prototype.update = function() {
                var i, layer, ease, start, end, j, cell, tile, k;
                for (i in this._layers)
                    if (this._layers.hasOwnProperty(i))
                        for (layer = this._layers[i], layer.view.removeChildren(), layer.view.filters && (layer.view.filters[0].maskSprite.x -= 200 * p3.Timestep.deltaTime), ease = this._camera.getLayerByName(i).parallax.x, start = Math.max(0, Math.min(layer.cells.length - 1, Math.floor((this._camera.position.x * ease - layer.tiles[0].x) / p3.View.width) - 1)), end = Math.min(layer.cells.length - 1, start + 3), end == layer.cells.length - 1 && (this.repeatTiles(layer, start), start = Math.max(0, Math.min(layer.cells.length - 1, Math.floor((this._camera.position.x * ease - layer.tiles[0].x) / p3.View.width) - 1)), end = Math.min(layer.cells.length - 1, start + 3)), j = start; j <= end; ++j)
                            for (cell = layer.cells[j], k = 0; k < cell.length; ++k) tile = cell[k], tile.x + tile.texture.width > this._camera.position.x * ease && tile.x - tile.texture.width < this._camera.position.x * ease + p3.View.width && layer.view.addChild(tile)
            }, Object.defineProperty(World.prototype, "view", {
                get: function() {
                    return this._view
                }
            }), Object.defineProperty(World.prototype, "camera", {
                get: function() {
                    return this._camera
                }
            }), Object.defineProperty(World.prototype, "game", {
                get: function() {
                    return this._game
                }
            }), Object.defineProperty(World.prototype, "length", {
                get: function() {
                    return this._length
                }
            })
        }, {
            "./Common": 25,
            "./WorldLayer": 71
        }],
        71: [function(require, module, exports) {
            "use strict";

            function WorldLayer() {
                this.view = new PIXI.Container, this.tiles = [], this.cells = []
            }
            module.exports = WorldLayer
        }, {}]
    }, {}, [50])(50)
});