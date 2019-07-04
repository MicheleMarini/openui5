/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/DefaultVariant",
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils"
], function(
	DefaultVariant,
	StandardVariant,
	ChangePersistenceFactory,
	Settings,
	Utils
) {
	"use strict";

	/**
	 * Provides an API to handle specific functionalities for sap.ui.comp library.
	 *
	 * @namespace
	 * @name sap.ui.fl.apply.api.SmartVariantManagementApplyAPI
	 * @author SAP SE
	 * @public
	 */
	var SmartVariantManagementApplyAPI = {

		_PERSISTENCY_KEY: "persistencyKey",

		/**
		 * Calls the back end asynchronously and fetches all changes and variants pointing to this control.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @see sap.ui.fl.Change
		 * @returns {Promise} Result is a map with key changeId and value instance of sap.ui.fl.Change
		 * @public
		 */
		loadChanges: function(oControl) {
			var oAppDescriptor = Utils.getAppDescriptor(oControl);
			var sSiteId = Utils.getSiteId(oControl);
			var sStableId = this._getStableId(oControl);

			var mPropertyBag = {
				appDescriptor: oAppDescriptor,
				siteId: sSiteId,
				includeVariants: true
			};

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);

			return oChangePersistence.getChangesForVariant(this._PERSISTENCY_KEY, sStableId, mPropertyBag);
		},

		/**
		 * Returns the change for the provided id.
		 *
		 * @see sap.ui.fl.Change
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @param {string} sId of change or variant
		 * @returns {sap.ui.fl.Change} change or variant object
		 * @public
		 */
		getChangeById: function (oControl, sId) {
			if (!sId || !oControl) {
				Utils.log.error("sId or oControl is not defined");
				return undefined;
			}
			var oChanges = this._getChangeMap(oControl);

			return oChanges[sId];
		},

		/**
		 * Checks whether sharing of variants is enabled.
		 *
		 * @public
		 * @returns {boolean} true if sharing of variants is enabled
		 */
		isVariantSharingEnabled: function() {
			return Settings.getInstance().then(function (oInstance) {
				return oInstance.isVariantSharingEnabled();
			});
		},

		/**
		 * Indicates if the current application is a variant of an existing one
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {boolean} true if it's an application variant
		 * @public
		 */
		isApplicationVariant: function(oControl) {
			if (Utils.isApplicationVariant(oControl)) {
				return true;
			}

			var oComponent = Utils.getComponentForControl(oControl);

			// special case for SmartTemplating to reach the real appComponent
			if (oComponent && oComponent.getAppComponent) {
				oComponent = oComponent.getAppComponent();

				if (oComponent) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Indicates if the VENDOR is selected
		 *
		 * @returns {boolean} true if it's an application variant
		 * @public
		 */
		isVendorLayer: function() {
			return Utils.isVendorLayer();
		},

		/**
		 * Returns a flag whether the variant downport scenario is enabled or not. This scenario is only enabled if the current layer is the vendor layer
		 * and the url parameter hotfix is set to true.
		 *
		 * @returns {boolean} Flag whether the variant downport scenario is enabled
		 * @public
		 */
		isVariantDownport: function() {
			return SmartVariantManagementApplyAPI.isVendorLayer() && Utils.isHotfixMode();
		},

		/**
		 * Retrieves the default variant for the current control synchronously. WARNING: It is the responsibility of the consumer to make sure, that the
		 * changes have already been retrieved with getChanges. It's recommended to use the async API getDefaultVariantId which works regardless of any
		 * preconditions.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {String} id of the default variant
		 * @public
		 */
		getDefaultVariantId: function(oControl) {
			var oChanges = this._getChangeMap(oControl);

			return DefaultVariant.getDefaultVariantId(oChanges);
		},

		/**
		 * Retrieves the execute on select for the standard variant for the current control synchronously. WARNING: It is the responsibility of the consumer to make sure, that the
		 * changes have already been retrieved with getChanges. It's recommended to use the async API getExecuteOnSelect which works regardless of any
		 * preconditions.
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {boolean} execute on select flag
		 * @public
		 */
		getExecuteOnSelect: function(oControl) {
			var oChanges = this._getChangeMap(oControl);

			return StandardVariant.getExecuteOnSelect(oChanges);
		},

		/**
		 * Determines the value of the stable id property of the control
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {String | undefined} Stable Id. Empty string if stable id determination failed
		 * @private
		 */
		_getStableId: function(oControl) {
			if (!oControl) {
				return undefined;
			}

			var sStableId;
			try {
				sStableId = oControl.getPersistencyKey();
			} catch (exception) {
				sStableId = "";
			}
			return sStableId;
		},

		/**
		 * Returns the SmartVariant - ChangeMap from the Change Persistence
		 *
		 * @param {sap.ui.comp.smartvariants.SmartVariantManagement} oControl - SAPUI5 Smart Variant Management control
		 * @returns {object} A map of "persistencyKey" and belonging changes or an empty object
		 * @private
		 */
		_getChangeMap: function(oControl) {
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oControl);
			var sStableId = SmartVariantManagementApplyAPI._getStableId(oControl);

			return oChangePersistence.getSmartVariantManagementChangeMap()[sStableId] || {};
		}
	};

	return SmartVariantManagementApplyAPI;
}, true);