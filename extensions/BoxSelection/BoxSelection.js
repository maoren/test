/*!
 * LMV v7.87.0
 *
 * Copyright 2023 Autodesk, Inc.
 * All rights reserved.
 *
 * This computer source code and related instructions and comments are the
 * unpublished confidential and proprietary information of Autodesk, Inc.
 * and are protected under Federal copyright and state trade secret law.
 * They may not be disclosed to, copied or used by any third party without
 * the prior written consent of Autodesk, Inc.
 *
 * Autodesk Viewer SDK Usage Limitations:
 *
 * The Autodesk Viewer SDK JavaScript must be delivered from an
 * Autodesk-hosted URL.
 */
/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	var __webpack_modules__ = ({

/***/ "./extensions/BoxSelection/BoxIntersection.js":
/*!****************************************************!*\
  !*** ./extensions/BoxSelection/BoxIntersection.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BoxIntersection": () => (/* binding */ BoxIntersection)
/* harmony export */ });
/* harmony import */ var _poly_clip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./poly_clip */ "./extensions/BoxSelection/poly_clip.js");
/* harmony import */ var _thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../thirdparty/three.js/three-legacy */ "./thirdparty/three.js/three-legacy.js");

//Based on https://github.com/mrdoob/three.js/blob/dev/examples/jsm/interactive/SelectionBox.js

//import * as THREE from "three";




const { enumMeshLines, enumMeshTriangles } = Autodesk.Viewing.Private.VertexEnumerator;

const Frustum = THREE.Frustum;
const Vector3 = THREE.Vector3;
const Vector4 = THREE.Vector4;
const Box3 = THREE.Box3;
const Matrix4 = THREE.Matrix4;

/**
 * This is a class to check whether objects are in a selection area in 3D space
 */

var frustum = new Frustum();
var viewProj = new Matrix4();
var tmpMat = new Matrix4();

var ndcBox = new THREE.Box3();
ndcBox.min.x = -1;ndcBox.min.y = -1;ndcBox.min.z = -1;
ndcBox.max.x = 1;ndcBox.max.y = 1;ndcBox.max.z = 1;

var tempBox = new Box3();

var vecTopLeft = new Vector3();
var vecTopRight = new Vector3();
var vecDownRight = new Vector3();
var vecDownLeft = new Vector3();

var vecFarTopLeft = new Vector3();
var vecFarTopRight = new Vector3();
var vecFarDownRight = new Vector3();
var vecFarDownLeft = new Vector3();

var vectemp1 = new Vector3();
var vectemp2 = new Vector3();

var v41 = new Vector4();
var v42 = new Vector4();
var v43 = new Vector4();

const OUTSIDE = 0;
const INTERSECTS = 1;
const CONTAINS = 2;

function frustumIntersectsBox(frustum, box) {

  //Copied from three.js and modified to return separate
  //value for full containment versus intersection.
  //Return values: 0 -> outside, 1 -> intersects, 2 -> contains

  var p1 = vectemp1;
  var p2 = vectemp2;
  var planes = frustum.planes;
  var contained = 0;

  for (var i = 0; i < 6; i++) {

    var plane = planes[i];

    p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
    p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
    p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
    p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
    p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
    p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

    var d1 = plane.distanceToPoint(p1);
    var d2 = plane.distanceToPoint(p2);

    // if both outside plane, no intersection

    if (d1 < 0 && d2 < 0) {

      return OUTSIDE;

    }

    if (d1 > 0 && d2 > 0) {

      contained++;

    }
  }

  return contained === 6 ? CONTAINS : INTERSECTS;
}

/**
 * @param v {THREE.Vector3}
 * @param m {THREE.Matrix4}
 * @param out {THREE.Vector4}
 */
function applyProjection(v, m, out) {

  //Similar to Vector3.applyProjection, but without perspective divide (leaves output in clip space).

  let x = v.x,y = v.y,z = v.z;

  let e = m.elements;

  out.x = e[0] * x + e[4] * y + e[8] * z + e[12];
  out.y = e[1] * x + e[5] * y + e[9] * z + e[13];
  out.z = e[2] * x + e[6] * y + e[10] * z + e[14];
  out.w = e[3] * x + e[7] * y + e[11] * z + e[15];
}

/**
 * @param {BufferGeometry} geom
 * @param {Matrix4} mvpMtx
 * @param {Box3} ndcBox
 * @param {Boolean} containmentOnly
 */
function geomIntersectsNDC(geom, mvpMtx, ndcBox, containmentOnly) {

  let contains = true;
  let intersects = false;

  if (geom.isLine) {
    enumMeshLines(geom, (vA, vB) => {

      //Get the line into NDC coordinates and do the
      //clipping check by faking a triangle.
      applyProjection(vA, mvpMtx, v41);
      applyProjection(vB, mvpMtx, v42);

      let pIn = [v41, v42, v43];
      let result = (0,_poly_clip__WEBPACK_IMPORTED_MODULE_0__.poly_clip_to_box)(pIn, ndcBox);

      if (result !== _poly_clip__WEBPACK_IMPORTED_MODULE_0__.POLY_CLIP_IN) {
        contains = false;
      }

      if (result !== _poly_clip__WEBPACK_IMPORTED_MODULE_0__.POLY_CLIP_OUT) {
        intersects = true;
      }

      //TODO: we can early out here if we can definitively reject containment or detect intersection
    });
  } else {

    enumMeshTriangles(geom, (vA, vB, vC) => {

      //Get the triangle into NDC coordinates and do the
      //clipping check.
      applyProjection(vA, mvpMtx, v41);
      applyProjection(vB, mvpMtx, v42);
      applyProjection(vC, mvpMtx, v43);

      let pIn = [v41, v42, v43];
      let result = (0,_poly_clip__WEBPACK_IMPORTED_MODULE_0__.poly_clip_to_box)(pIn, ndcBox);

      if (result !== _poly_clip__WEBPACK_IMPORTED_MODULE_0__.POLY_CLIP_IN) {
        contains = false;
      }

      if (result !== _poly_clip__WEBPACK_IMPORTED_MODULE_0__.POLY_CLIP_OUT) {
        intersects = true;
      }

      //TODO: we can early out here if we can definitively reject containment or detect intersection
    });
  }

  if (contains) {
    return CONTAINS;
  } else if (intersects) {
    return INTERSECTS;
  } else {
    return OUTSIDE;
  }
}



/**
* @param camera {UnifiedCamera}
 * @param scene {RenderScene}
 */
function BoxIntersection(camera, scene) {

  this.camera = camera;
  this.scene = scene;
  this.startPoint = new Vector3();
  this.endPoint = new Vector3();
  this.result = [];
}

BoxIntersection.prototype.select = function (startPoint, endPoint, containmentOnly) {

  this.startPoint = startPoint || this.startPoint;
  this.endPoint = endPoint || this.endPoint;
  this.result = [];

  this.updateFrustum(this.startPoint, this.endPoint);
  this.searchChildInRenderScene(frustum, containmentOnly);

  return this.result;
};

BoxIntersection.prototype.updateFrustum = function (startPoint, endPoint) {

  startPoint = startPoint || this.startPoint;
  endPoint = endPoint || this.endPoint;

  // Avoid invalid frustum

  if (startPoint.x === endPoint.x) {

    endPoint.x += Number.EPSILON;

  }

  if (startPoint.y === endPoint.y) {

    endPoint.y += Number.EPSILON;

  }

  this.camera.updateProjectionMatrix();
  this.camera.updateMatrixWorld();

  viewProj.multiplyMatrices(this.camera.projectionMatrix, viewProj.copy(this.camera.matrixWorld).invert());

  var left = Math.min(startPoint.x, endPoint.x);
  var top = Math.max(startPoint.y, endPoint.y);
  var right = Math.max(startPoint.x, endPoint.x);
  var down = Math.min(startPoint.y, endPoint.y);

  vecTopLeft.set(left, top, -1);
  vecTopRight.set(right, top, -1);
  vecDownRight.set(right, down, -1);
  vecDownLeft.set(left, down, -1);

  vecFarTopLeft.set(left, top, 1);
  vecFarTopRight.set(right, top, 1);
  vecFarDownRight.set(right, down, 1);
  vecFarDownLeft.set(left, down, 1);

  ndcBox.min.x = left;
  ndcBox.min.y = down;
  ndcBox.min.z = -1;
  ndcBox.max.x = right;
  ndcBox.max.y = top;
  ndcBox.max.z = 1;

  tmpMat.copy(viewProj).invert();

  vecTopLeft = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecTopLeft, tmpMat);
  vecTopRight = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecTopRight, tmpMat);
  vecDownRight = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecDownRight, tmpMat);
  vecDownLeft = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecDownLeft, tmpMat);

  vecFarTopLeft = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecFarTopLeft, tmpMat);
  vecFarTopRight = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecFarTopRight, tmpMat);
  vecFarDownRight = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecFarDownRight, tmpMat);
  vecFarDownLeft = (0,_thirdparty_three_js_three_legacy__WEBPACK_IMPORTED_MODULE_1__.vector3ApplyProjection)(vecFarDownLeft, tmpMat);

  var planes = frustum.planes;

  planes[0].setFromCoplanarPoints(vecTopLeft, vecFarTopLeft, vecFarTopRight);
  planes[1].setFromCoplanarPoints(vecTopRight, vecFarTopRight, vecFarDownRight);
  planes[2].setFromCoplanarPoints(vecFarDownRight, vecFarDownLeft, vecDownLeft);
  planes[3].setFromCoplanarPoints(vecFarDownLeft, vecFarTopLeft, vecTopLeft);
  planes[4].setFromCoplanarPoints(vecTopRight, vecDownRight, vecDownLeft);
  planes[5].setFromCoplanarPoints(vecFarDownRight, vecFarTopRight, vecFarTopLeft);

};

/**
 * @param frustum {THREE.Frustum}
 * @param containmentOnly {Boolean}
 */
BoxIntersection.prototype.searchChildInRenderScene = function (frustum, containmentOnly) {

  let models = this.scene.getModels();

  //This is in effect a simple simulation of the main LMV FrustumIntersector that just does box intersection
  let myCustomIntersector = {
    intersectsBox: function (box) {
      return frustumIntersectsBox(frustum, box);
    } };


  for (let model of models) {

    let fl = model.getFragmentList();

    //Keeps track of intersection/containment state per element.
    //We need to keep state for elements that are composed of multiple fragments
    //in case we need to verify the whole element is fully contained by the search box.
    let dbIdStatus = new Map();

    model.getIterator().intersectFrustum(myCustomIntersector, (fragId, containmentKnown) => {

      let fragState;

      if (containmentKnown) {
        fragState = CONTAINS;
      } else {
        fl.getWorldBounds(fragId, tempBox);
        fragState = frustumIntersectsBox(frustum, tempBox);
      }

      if (fragState === OUTSIDE) {
        return;
      }

      if (fragState !== CONTAINS) {

        //The fragment intersects the frustum in a non-trivial. Now we have to do hard work and check each triangle or line.

        //Get the model-view-projection matrix
        fl.getWorldMatrix(fragId, tmpMat);
        tmpMat.multiplyMatrices(viewProj, tmpMat);

        let geom = fl.getGeometry(fragId);

        fragState = geomIntersectsNDC(geom, tmpMat, ndcBox, containmentOnly);
      }

      if (fragState === OUTSIDE) {
        return;
      }

      //Fragment is either inside or intersects the frustum
      let dbId = fl.getDbIds(fragId);

      let curStatus = dbIdStatus.get(dbId);
      if (curStatus === undefined) {
        dbIdStatus.set(dbId, fragState);
      } else if (curStatus === CONTAINS && fragState !== CONTAINS) {
        dbIdStatus.set(dbId, fragState);
      }
    });

    if (containmentOnly) {
      //containment only -- return element IDs whose fragments are entirely contained in the search box
      let res = { model, ids: [] };
      dbIdStatus.forEach((value, key) => {
        if (value === CONTAINS) {
          res.ids.push(key);
        }
      });
      this.result.push(res);
    } else {
      //Any intersection acceptable, return result without filtering
      this.result.push({ model, ids: Array.from(dbIdStatus.keys()) });
    }

  }

};

/***/ }),

/***/ "./extensions/BoxSelection/BoxSelectionLocales.js":
/*!********************************************************!*\
  !*** ./extensions/BoxSelection/BoxSelectionLocales.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "locales": () => (/* binding */ locales)
/* harmony export */ });
/* harmony import */ var _res_locales_en_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../res/locales/en/nobundle-BoxSelection.loc.json */ "./res/locales/en/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_en_GB_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../res/locales/en-GB/nobundle-BoxSelection.loc.json */ "./res/locales/en-GB/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_cs_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../res/locales/cs/nobundle-BoxSelection.loc.json */ "./res/locales/cs/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_de_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../res/locales/de/nobundle-BoxSelection.loc.json */ "./res/locales/de/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_es_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../res/locales/es/nobundle-BoxSelection.loc.json */ "./res/locales/es/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_fr_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../res/locales/fr/nobundle-BoxSelection.loc.json */ "./res/locales/fr/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_fr_CA_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../res/locales/fr-CA/nobundle-BoxSelection.loc.json */ "./res/locales/fr-CA/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_it_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../res/locales/it/nobundle-BoxSelection.loc.json */ "./res/locales/it/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_ja_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../res/locales/ja/nobundle-BoxSelection.loc.json */ "./res/locales/ja/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_ko_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../res/locales/ko/nobundle-BoxSelection.loc.json */ "./res/locales/ko/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_pl_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../res/locales/pl/nobundle-BoxSelection.loc.json */ "./res/locales/pl/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_pt_BR_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../res/locales/pt-BR/nobundle-BoxSelection.loc.json */ "./res/locales/pt-BR/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_ru_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../res/locales/ru/nobundle-BoxSelection.loc.json */ "./res/locales/ru/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_tr_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../res/locales/tr/nobundle-BoxSelection.loc.json */ "./res/locales/tr/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_zh_Hans_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../res/locales/zh-Hans/nobundle-BoxSelection.loc.json */ "./res/locales/zh-Hans/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_zh_Hant_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../res/locales/zh-Hant/nobundle-BoxSelection.loc.json */ "./res/locales/zh-Hant/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_zh_HK_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../res/locales/zh-HK/nobundle-BoxSelection.loc.json */ "./res/locales/zh-HK/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_nl_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../res/locales/nl/nobundle-BoxSelection.loc.json */ "./res/locales/nl/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_sv_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../res/locales/sv/nobundle-BoxSelection.loc.json */ "./res/locales/sv/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_da_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../res/locales/da/nobundle-BoxSelection.loc.json */ "./res/locales/da/nobundle-BoxSelection.loc.json");
/* harmony import */ var _res_locales_no_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../res/locales/no/nobundle-BoxSelection.loc.json */ "./res/locales/no/nobundle-BoxSelection.loc.json");
/**
 * Include each locale json file and return it in an object
 * that can be consumed by i18n
 */























const locales = {
  en: _res_locales_en_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_0__,
  'en-GB': _res_locales_en_GB_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_1__,
  cs: _res_locales_cs_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_2__,
  de: _res_locales_de_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_3__,
  es: _res_locales_es_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_4__,
  fr: _res_locales_fr_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_5__,
  "fr-CA": _res_locales_fr_CA_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_6__,
  it: _res_locales_it_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_7__,
  ja: _res_locales_ja_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_8__,
  ko: _res_locales_ko_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_9__,
  pl: _res_locales_pl_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_10__,
  "pt-BR": _res_locales_pt_BR_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_11__,
  ru: _res_locales_ru_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_12__,
  tr: _res_locales_tr_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_13__,
  "zh-Hans": _res_locales_zh_Hans_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_14__,
  "zh-Hant": _res_locales_zh_Hant_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_15__,
  "zh-HK": _res_locales_zh_HK_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_16__,
  nl: _res_locales_nl_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_17__,
  sv: _res_locales_sv_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_18__,
  da: _res_locales_da_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_19__,
  no: _res_locales_no_nobundle_BoxSelection_loc_json__WEBPACK_IMPORTED_MODULE_20__ };

/***/ }),

/***/ "./extensions/BoxSelection/BoxSelectionTool.js":
/*!*****************************************************!*\
  !*** ./extensions/BoxSelection/BoxSelectionTool.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BoxSelectionTool": () => (/* binding */ BoxSelectionTool)
/* harmony export */ });
/* harmony import */ var _BoxIntersection__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BoxIntersection */ "./extensions/BoxSelection/BoxIntersection.js");


class BoxSelectionTool {

  /**
   * @param {Autodesk.Viewing.Viewer3D} viewer
   * @param {Object} options
   * @param {string} options.cssClassName  CSS class used for the box. Default 'box-selection'.
   */
  constructor(viewer) {let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.viewer = viewer;
    this.options = options;

    this.isDown = false;

    this.element = document.createElement('div');
    this.styleContains = this.options.styleContains || this.options.cssClassName || 'box-selection-contains';
    this.styleIntersects = this.options.styleIntersects || this.options.cssClassName || 'box-selection-intersects';
    this.element.classList.add(this.styleContains);
    this.element.style.pointerEvents = 'none';

    this.startPoint = new THREE.Vector2();
    this.endPoint = new THREE.Vector2();

    this.useGeometricIntersection = this.options.useGeometricIntersection;
    this.boxIntersection = new _BoxIntersection__WEBPACK_IMPORTED_MODULE_0__.BoxIntersection(this.viewer.getCamera(), this.viewer.impl.modelQueue());
  }

  getName() {
    return 'box-selection';
  }

  getNames() {
    return ['box-selection'];
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.onSelectOver();
    this.active = false;
  }

  isActive() {
    return this.active;
  }

  getCursor() {
    return 'crosshair';
  }

  register() {}

  handleGesture(event) {
    switch (event.type) {
      case 'dragstart':
        return this.handleButtonDown(event, 0);

      case 'dragmove':
        return this.handleMouseMove(event);

      case 'dragend':
        return this.handleButtonUp(event, 0);

      default:
        break;}


    return false;
  }

  handleButtonDown(event, button) {
    // only handle left click
    if (button !== 0) {
      return false;
    }

    this.viewer.impl.selector.clearSelection();

    this.isDown = true;
    this.onSelectStart(event);

    return true;
  }

  handleMouseMove(event) {
    if (!this.isDown) {
      return false;
    }

    this.onSelectMove(event);

    return true;
  }

  handleButtonUp(event, button) {
    // only handle left click
    if (button !== 0) {
      return false;
    }

    this.isDown = false;
    this.onSelectOver(event);

    const selection = this.getSelection();
    selection.forEach((s) => {
      s.selectionType = this.options.selectionType;
    });
    this.viewer.impl.selector.setAggregateSelection(selection);

    return true;
  }

  getSelection() {
    const clientRect = this.viewer.impl.getCanvasBoundingClientRect();

    const vpVecBL = this.viewer.impl.clientToViewport(
    Math.min(this.startPoint.x, this.endPoint.x) - clientRect.left,
    Math.max(this.startPoint.y, this.endPoint.y) - clientRect.top);


    const vpVecTR = this.viewer.impl.clientToViewport(
    Math.max(this.startPoint.x, this.endPoint.x) - clientRect.left,
    Math.min(this.startPoint.y, this.endPoint.y) - clientRect.top);


    if (this.useGeometricIntersection) {
      //Use geometric selection
      return this.boxIntersection.select(vpVecBL, vpVecTR, this.endPoint.x > this.startPoint.x);

    } else {
      //Model is not 3D, use ID buffer selection

      const hits = this.viewer.impl.hitBoxTestViewport(
      vpVecBL,
      Math.abs(this.startPoint.x - this.endPoint.x) / this.viewer.impl.canvas.clientWidth,
      Math.abs(this.startPoint.y - this.endPoint.y) / this.viewer.impl.canvas.clientHeight);


      // aggregate hits in a selection format way
      const selection = [];
      const modelsHitsByModelId = {};
      const modelsById = {};

      for (let i = 0; i < hits.length; i++) {
        const modelId = hits[i].model.id;
        if (!modelsById[modelId]) {
          modelsById[modelId] = hits[i].model;
        }
        if (!modelsHitsByModelId[modelId]) {
          modelsHitsByModelId[modelId] = [];
        }
        modelsHitsByModelId[modelId].push(hits[i].dbId);
      }

      for (let modelId in modelsHitsByModelId) {
        selection.push({
          model: modelsById[modelId],
          ids: modelsHitsByModelId[modelId] });

      }

      return selection;
    }

  }

  onSelectStart(event) {
    this.viewer.canvas.parentElement.appendChild(this.element);

    this.element.style.left = event.clientX + 'px';
    this.element.style.top = event.clientY + 'px';
    this.element.style.width = '0px';
    this.element.style.height = '0px';

    this.startPoint.x = event.clientX;
    this.startPoint.y = event.clientY;
  }

  onSelectMove(event) {

    this.endPoint.x = event.clientX;
    this.endPoint.y = event.clientY;

    let left = Math.min(this.startPoint.x, this.endPoint.x);
    let right = Math.max(this.startPoint.x, this.endPoint.x);
    let top = Math.min(this.startPoint.y, this.endPoint.y);
    let bottom = Math.max(this.startPoint.y, this.endPoint.y);

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
    this.element.style.width = right - left + "px";
    this.element.style.height = bottom - top + "px";

    if (this.useGeometricIntersection && this.endPoint.x >= this.startPoint.x) {
      this.element.classList.replace(this.styleIntersects, this.styleContains);
    } else {
      this.element.classList.replace(this.styleContains, this.styleIntersects);
    }
  }

  onSelectOver() {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }}

/***/ }),

/***/ "./extensions/BoxSelection/poly_clip.js":
/*!**********************************************!*\
  !*** ./extensions/BoxSelection/poly_clip.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "POLY_CLIP_IN": () => (/* binding */ POLY_CLIP_IN),
/* harmony export */   "POLY_CLIP_OUT": () => (/* binding */ POLY_CLIP_OUT),
/* harmony export */   "POLY_CLIP_PARTIAL": () => (/* binding */ POLY_CLIP_PARTIAL),
/* harmony export */   "poly_clip_to_box": () => (/* binding */ poly_clip_to_box)
/* harmony export */ });
/*
 * Generic Convex Polygon Scan Conversion and Clipping
 * by Paul Heckbert
 * from "Graphics Gems", Academic Press, 1990
 */

/*
 * poly_clip.c: homogeneous 3-D convex polygon clipper
 *
 * Paul Heckbert	1985, Dec 1989
 */

//https://github.com/erich666/GraphicsGems/blob/master/gems/PolyScan/poly_clip.c

const Vector4 = THREE.Vector4;


const POLY_CLIP_OUT = 0; /* polygon entirely outside box */
const POLY_CLIP_PARTIAL = 1; /* polygon partially inside */
const POLY_CLIP_IN = 2; /* polygon entirely inside box */


function SWAP(a, b, temp) {temp[0] = a[0];a[0] = b[0];b[0] = temp[0];}
function COORD(vert, i) {
  switch (i) {
    case 0:return vert.x;
    case 1:return vert.y;
    case 2:return vert.z;}


  return 0;
}

function CLIP_AND_SWAP(elem, sign, k, p, q, r) {
  poly_clip_to_halfspace(p[0], q[0], elem, sign, sign * k);
  if (q[0].length === 0) {
    return POLY_CLIP_OUT;
  }
  SWAP(p, q, r);
  return POLY_CLIP_PARTIAL;
}

/*
 * poly_clip_to_box: Clip the convex polygon p1 to the screen space box
 * using the homogeneous screen coordinates (sx, sy, sz, sw) of each vertex,
 * testing if v->sx/v->sw > box->x0 and v->sx/v->sw < box->x1,
 * and similar tests for y and z, for each vertex v of the polygon.
 * If polygon is entirely inside box, then POLY_CLIP_IN is returned.
 * If polygon is entirely outside box, then POLY_CLIP_OUT is returned.
 * Otherwise, if the polygon is cut by the box, p1 is modified and
 * POLY_CLIP_PARTIAL is returned.
 *
 * Given an n-gon as input, clipping against 6 planes could generate an
 * (n+6)gon, so POLY_NMAX in poly.h must be big enough to allow that.
 */

/**
 * @param p1 {THREE.Vector4[]}
 * @param box {THREE.Box3}
 */
function poly_clip_to_box(p1, box)
{
  var x0out = 0,x1out = 0,y0out = 0,y1out = 0,z0out = 0,z1out = 0;

  /* count vertices "outside" with respect to each of the six planes */
  var pn = p1.length;
  for (var i = 0; i < pn; i++) {
    var v = p1[i];
    if (v.x < box.min.x * v.w) x0out++; /* out on left */
    if (v.x > box.max.x * v.w) x1out++; /* out on right */
    if (v.y < box.min.y * v.w) y0out++; /* out on top */
    if (v.y > box.max.y * v.w) y1out++; /* out on bottom */
    if (v.z < box.min.z * v.w) z0out++; /* out on near */
    if (v.z > box.max.z * v.w) z1out++; /* out on far */
  }

  /* check if all vertices inside */
  if (x0out + x1out + y0out + y1out + z0out + z1out === 0) return POLY_CLIP_IN;

  /* check if all vertices are "outside" any of the six planes */
  if (x0out === pn || x1out === pn || y0out === pn || y1out === pn || z0out === pn || z1out === pn) {
    p1.length = 0;
    return POLY_CLIP_OUT;
  }

  /*
   * now clip against each of the planes that might cut the polygon,
   * at each step toggling between polygons p1 and p2
   */
  var p2 = [];
  var p = [p1],q = [p2],r = [null];

  if (x0out) if (CLIP_AND_SWAP(0 /*sx*/, -1., box.min.x, p, q, r) === POLY_CLIP_OUT) {p1.length = 0;return POLY_CLIP_OUT;}
  if (x1out) if (CLIP_AND_SWAP(0 /*sx*/, 1., box.max.x, p, q, r) === POLY_CLIP_OUT) {p1.length = 0;return POLY_CLIP_OUT;}
  if (y0out) if (CLIP_AND_SWAP(1 /*sy*/, -1., box.min.y, p, q, r) === POLY_CLIP_OUT) {p1.length = 0;return POLY_CLIP_OUT;}
  if (y1out) if (CLIP_AND_SWAP(1 /*sy*/, 1., box.max.y, p, q, r) === POLY_CLIP_OUT) {p1.length = 0;return POLY_CLIP_OUT;}
  if (z0out) if (CLIP_AND_SWAP(2 /*sz*/, -1., box.min.z, p, q, r) === POLY_CLIP_OUT) {p1.length = 0;return POLY_CLIP_OUT;}
  if (z1out) if (CLIP_AND_SWAP(2 /*sz*/, 1., box.max.z, p, q, r) === POLY_CLIP_OUT) {p1.length = 0;return POLY_CLIP_OUT;}

  /* if result ended up in p2 then copy it to p1 */
  if (p[0] === p2) {
    p1.length = 0;
    p1.push(...p2);
  }
  return POLY_CLIP_PARTIAL;
}

/*
 * poly_clip_to_halfspace: clip convex polygon p against a plane,
 * copying the portion satisfying sign*s[index] < k*sw into q,
 * where s is a Poly_vert* cast as a double*.
 * index is an index into the array of doubles at each vertex, such that
 * s[index] is sx, sy, or sz (screen space x, y, or z).
 * Thus, to clip against xmin, use
 *	poly_clip_to_halfspace(p, q, XINDEX, -1., -xmin);
 * and to clip against xmax, use
 *	poly_clip_to_halfspace(p, q, XINDEX,  1.,  xmax);
 */

function poly_clip_to_halfspace(p, q, index, sign, k)
/*
Poly *p, *q;
register int index;
double sign, k;
*/
{
  var v;
  var u;
  var t, tu, tv;

  q.length = 0;

  /* start with u=vert[n-1], v=vert[0] */
  u = p.length && p[p.length - 1];
  tu = sign * COORD(u, index) - u.w * k;
  for (var i = 0; i < p.length; i++, u = v, tu = tv) {
    v = p[i];
    /* on old polygon (p), u is previous vertex, v is current vertex */
    /* tv is negative if vertex v is in */
    tv = sign * COORD(v, index) - v.w * k;
    if (tu <= 0. ^ tv <= 0.) {
      /* edge crosses plane; add intersection point to q */
      t = tu / (tu - tv);
      var w = new Vector4();
      w.x = u.x + t * (v.x - u.x);
      w.y = u.y + t * (v.y - u.y);
      w.z = u.z + t * (v.z - u.z);
      w.w = u.w + t * (v.w - u.w);
      q.push(w);
    }
    if (tv <= 0.) /* vertex v is in, copy it to q */
      q.push(v.clone());
  }
}

/***/ }),

/***/ "./thirdparty/three.js/three-legacy.js":
/*!*********************************************!*\
  !*** ./thirdparty/three.js/three-legacy.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "planeOrthoPoint": () => (/* binding */ planeOrthoPoint),
/* harmony export */   "vector3ApplyProjection": () => (/* binding */ vector3ApplyProjection)
/* harmony export */ });
// Plane.orthoPoint was removed in R87, the polyfilled version for R125 was taken from R86
// https://github.com/mrdoob/three.js/blob/r86/src/math/Plane.js#L117-L124
const planeOrthoPoint = (plane, point, optionalTarget) => {

  {
    return plane.orthoPoint(point, optionalTarget);
  }







};

const vector3ApplyProjection = (v, m) => {

  {
    return v.applyProjection(m);
  }





};

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[5].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[5].use[2]!./node_modules/css-unicode-loader/index.js!./node_modules/sass-loader/dist/cjs.js!./extensions/BoxSelection/BoxSelection.css":
/*!****************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[5].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[5].use[2]!./node_modules/css-unicode-loader/index.js!./node_modules/sass-loader/dist/cjs.js!./extensions/BoxSelection/BoxSelection.css ***!
  \****************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".icon-box-selection {\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1;\n  stroke-dasharray: 4 2;\n}\n\n.box-selection-contains {\n  border: 1px solid #808080;\n  background-color: rgba(75, 160, 255, 0.3);\n  position: fixed;\n}\n\n.box-selection-intersects {\n  border: 1px dotted #808080;\n  background-color: rgba(75, 255, 160, 0.3);\n  position: fixed;\n}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/noSourceMaps.js":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/noSourceMaps.js ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ "./extensions/BoxSelection/BoxSelection.css":
/*!**************************************************!*\
  !*** ./extensions/BoxSelection/BoxSelection.css ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_5_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_5_use_2_node_modules_css_unicode_loader_index_js_node_modules_sass_loader_dist_cjs_js_BoxSelection_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[5].use[1]!../../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[5].use[2]!../../node_modules/css-unicode-loader/index.js!../../node_modules/sass-loader/dist/cjs.js!./BoxSelection.css */ "./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[5].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[5].use[2]!./node_modules/css-unicode-loader/index.js!./node_modules/sass-loader/dist/cjs.js!./extensions/BoxSelection/BoxSelection.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_5_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_5_use_2_node_modules_css_unicode_loader_index_js_node_modules_sass_loader_dist_cjs_js_BoxSelection_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_5_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_5_use_2_node_modules_css_unicode_loader_index_js_node_modules_sass_loader_dist_cjs_js_BoxSelection_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_5_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_5_use_2_node_modules_css_unicode_loader_index_js_node_modules_sass_loader_dist_cjs_js_BoxSelection_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_5_use_1_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_5_use_2_node_modules_css_unicode_loader_index_js_node_modules_sass_loader_dist_cjs_js_BoxSelection_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./res/locales/cs/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/cs/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"cs","@@context":"Rozšíření BoxSelection","Select":"Vybrat"}');

/***/ }),

/***/ "./res/locales/da/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/da/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"da","@@context":"BoxSelection-udvidelse","Select":"Vælg"}');

/***/ }),

/***/ "./res/locales/de/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/de/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"de","@@context":"Erweiterung BoxSelection","Select":"Auswählen"}');

/***/ }),

/***/ "./res/locales/en-GB/nobundle-BoxSelection.loc.json":
/*!**********************************************************!*\
  !*** ./res/locales/en-GB/nobundle-BoxSelection.loc.json ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"en","@@context":"BoxSelection Extension","Select":"Select"}');

/***/ }),

/***/ "./res/locales/en/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/en/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"en","@@context":"BoxSelection Extension","Select":"Select"}');

/***/ }),

/***/ "./res/locales/es/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/es/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"es","@@context":"BoxSelection Extension","Select":"Seleccionar"}');

/***/ }),

/***/ "./res/locales/fr-CA/nobundle-BoxSelection.loc.json":
/*!**********************************************************!*\
  !*** ./res/locales/fr-CA/nobundle-BoxSelection.loc.json ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"fr-CA","@@context":"Extension BoxSelection","Select":"Sélectionner"}');

/***/ }),

/***/ "./res/locales/fr/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/fr/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"fr","@@context":"Extension BoxSelection","Select":"Sélectionner"}');

/***/ }),

/***/ "./res/locales/it/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/it/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"it","@@context":"Estensione BoxSelection","Select":"Seleziona"}');

/***/ }),

/***/ "./res/locales/ja/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/ja/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"ja","@@context":"BoxSelection Extension","Select":"選択"}');

/***/ }),

/***/ "./res/locales/ko/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/ko/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"ko","@@context":"BoxSelection 확장","Select":"선택"}');

/***/ }),

/***/ "./res/locales/nl/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/nl/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"nl","@@context":"BoxSelection-extensie","Select":"Selecteren"}');

/***/ }),

/***/ "./res/locales/no/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/no/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"no","@@context":"BoxSelection-utvidelse","Select":"Velg"}');

/***/ }),

/***/ "./res/locales/pl/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/pl/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"pl","@@context":"Rozszerzenie BoxSelection","Select":"Wybierz"}');

/***/ }),

/***/ "./res/locales/pt-BR/nobundle-BoxSelection.loc.json":
/*!**********************************************************!*\
  !*** ./res/locales/pt-BR/nobundle-BoxSelection.loc.json ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"pt","@@context":"Extensão BoxSelection","Select":"Selecionar"}');

/***/ }),

/***/ "./res/locales/ru/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/ru/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"ru","@@context":"Расширение BoxSelection","Select":"Выбрать"}');

/***/ }),

/***/ "./res/locales/sv/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/sv/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"sv","@@context":"BoxSelection-tillägg","Select":"Välj"}');

/***/ }),

/***/ "./res/locales/tr/nobundle-BoxSelection.loc.json":
/*!*******************************************************!*\
  !*** ./res/locales/tr/nobundle-BoxSelection.loc.json ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"tr","@@context":"BoxSelection Uzantısı","Select":"Seç"}');

/***/ }),

/***/ "./res/locales/zh-HK/nobundle-BoxSelection.loc.json":
/*!**********************************************************!*\
  !*** ./res/locales/zh-HK/nobundle-BoxSelection.loc.json ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"zh-hk","@@context":"BoxSelection 擴充程式","Select":"選取"}');

/***/ }),

/***/ "./res/locales/zh-Hans/nobundle-BoxSelection.loc.json":
/*!************************************************************!*\
  !*** ./res/locales/zh-Hans/nobundle-BoxSelection.loc.json ***!
  \************************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"zh-Hans","@@context":"BoxSelection 扩展","Select":"选择"}');

/***/ }),

/***/ "./res/locales/zh-Hant/nobundle-BoxSelection.loc.json":
/*!************************************************************!*\
  !*** ./res/locales/zh-Hant/nobundle-BoxSelection.loc.json ***!
  \************************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"@@locale":"zh-Hant","@@context":"BoxSelection 延伸","Select":"選取"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************************************************!*\
  !*** ./extensions/BoxSelection/BoxSelectionExtension.js ***!
  \**********************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BoxSelectionExtension": () => (/* binding */ BoxSelectionExtension)
/* harmony export */ });
/* harmony import */ var _BoxSelectionTool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BoxSelectionTool */ "./extensions/BoxSelection/BoxSelectionTool.js");
/* harmony import */ var _BoxSelectionLocales__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BoxSelectionLocales */ "./extensions/BoxSelection/BoxSelectionLocales.js");
/* harmony import */ var _BoxSelection_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./BoxSelection.css */ "./extensions/BoxSelection/BoxSelection.css");
const av = Autodesk.Viewing;
const btnStates = av.UI.Button.State;
const EXT_MODE = 'box-selection';
const TOOL_NAME = EXT_MODE;






/**
 * BoxSelectionExtension allows user to select elements with a mouse box.
 * 
 * The extension id is: `Autodesk.BoxSelection`
 * @example
 *   viewer.loadExtension('Autodesk.BoxSelection')
 * 
 * @memberof Autodesk.Viewing.Extensions
 * @alias Autodesk.Viewing.Extensions.BoxSelection
 * @see {@link Autodesk.Viewing.Extension} for common inherited methods.
 * @constructor
 */
class BoxSelectionExtension extends av.Extension {
  constructor(viewer) {let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super(viewer, options);
    this.name = EXT_MODE;
    this._onToolChanged = this._onToolChanged.bind(this);
    // Default to faster REGULAR selectionType, 
    // though this may be undesirable when unselected objects obscure the selected ones
    this.options.selectionType = options.selectionType || (options.useGeometricIntersection ? av.SelectionType.REGULAR : av.SelectionType.MIXED);
  }

  load() {
    this.extendLocalization(_BoxSelectionLocales__WEBPACK_IMPORTED_MODULE_1__.locales);
    this.boxSelectionTool = new _BoxSelectionTool__WEBPACK_IMPORTED_MODULE_0__.BoxSelectionTool(this.viewer, this.options);

    this.viewer.toolController.registerTool(this.boxSelectionTool, (enable, name) => {
      this.setActive(enable, name);
    });

    this.registerHotkeys();

    return true;
  }

  unload() {
    if (this.viewer.getActiveNavigationTool() === TOOL_NAME) {
      this.viewer.setActiveNavigationTool();
    }

    if (this.boxSelectionToolButton) {
      const navTools = this.viewer.getToolbar().getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);
      if (navTools) {
        navTools.removeControl(this.boxSelectionToolButton.getId());
        this.boxSelectionToolButton = null;
      }
    }

    this.viewer.toolController.deregisterTool(this.boxSelectionTool);
    this.viewer.removeEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this._onToolChanged);

    this.viewer.getHotkeyManager().popHotkeys('Autodesk.BoxSelection');

    return true;
  }

  createToolbarButton() {
    const button = new Autodesk.Viewing.UI.Button('toolbar-box-selection');
    button.setIcon('adsk-icon-selection');
    button.setToolTip('Select');
    button.onClick = () => {
      const state = button.getState();
      if (state === Autodesk.Viewing.UI.Button.State.INACTIVE) {
        this.activate(EXT_MODE);
      } else if (state === Autodesk.Viewing.UI.Button.State.ACTIVE) {
        this.deactivate();
      }
    };

    this.boxSelectionToolButton = button;
  }

  /**
   * 
   * @param {boolean} add true to add the toolbar button and false to remove it
   */
  addToolbarButton(add) {var _this$viewer$getToolb, _this$viewer;
    if (!this.boxSelectionToolButton) {
      return;
    }

    const toolbar = (_this$viewer$getToolb = (_this$viewer = this.viewer).getToolbar) === null || _this$viewer$getToolb === void 0 ? void 0 : _this$viewer$getToolb.call(_this$viewer);
    const navTools = toolbar === null || toolbar === void 0 ? void 0 : toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);
    if (!navTools) {
      return;
    }

    const exists = navTools.getControl(this.boxSelectionToolButton.getId());
    if (add && !exists) {
      navTools.addControl(this.boxSelectionToolButton, { index: 0 });
    } else if (!add && exists) {
      navTools.removeControl(this.boxSelectionToolButton);
    }
  }

  onToolbarCreated(toolbar) {
    // The _onToolChanged function will change the state of the button thus we will only add the event listener in here.
    this.viewer.addEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this._onToolChanged);

    this.createToolbarButton();

    // currently no toolbar button is added, as it changes the toolbar width and can break the existing layout
    this.addToolbarButton(false);
  }

  registerHotkeys() {
    const onPress = () => {
      if (!this.boxSelectionTool.isActive()) {
        this.viewer.toolController.activateTool(this.boxSelectionTool.getName());
        this.boxSelectionTool.__hotKey = true;
      }
      return true;
    };
    const onRelease = () => {
      if (this.boxSelectionTool.__hotKey) {
        this.viewer.toolController.deactivateTool(this.boxSelectionTool.getName());
        this.boxSelectionTool.__hotKey = false;
      }
      return true;
    };
    this.viewer.getHotkeyManager().pushHotkeys('Autodesk.BoxSelection', [
    {
      keycodes: [Autodesk.Viewing.KeyCode.CONTROL],
      onPress: onPress,
      onRelease: onRelease }]);


  }

  activate(mode) {
    if (mode === EXT_MODE) {
      this._updateActiveState(true);
      this.viewer.setActiveNavigationTool(EXT_MODE);
    }

    return true;
  }

  deactivate() {
    this.viewer.setActiveNavigationTool();
    this._updateActiveState(false);
    return true;
  }

  /**
   * 
   * @param {Autodesk.Viewing.SelectionType} selectionType - Determines how selected nodes are displayed with tinting and/or overlay effect
   */
  setSelectionType(selectionType) {
    this.options.selectionType = selectionType || av.SelectionType.REGULAR;
  }

  _updateActiveState(isActive) {
    this.activeStatus = isActive;
    this.mode = isActive ? EXT_MODE : '';
  }

  /**
   * Handles the TOOL_CHANGE_EVENT event
   * @param {*} event
   * @private
   */
  _onToolChanged(event) {
    if (event.toolName === TOOL_NAME && this.boxSelectionToolButton) {
      const state = event.active ? btnStates.ACTIVE : btnStates.INACTIVE;
      this.boxSelectionToolButton.setState(state);
      // This will ensure that the active state of the extension matches the tool. eg. this.isActive('box-selection')
      this._updateActiveState(!state);
    }
  }}



av.theExtensionManager.registerExtension('Autodesk.BoxSelection', BoxSelectionExtension);
})();

Autodesk.Extensions.BoxSelection = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=BoxSelection.js.map