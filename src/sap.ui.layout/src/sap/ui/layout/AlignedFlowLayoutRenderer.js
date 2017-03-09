/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
	function (library) {
		"use strict";

		/**
		 * AlignedFlowLayout renderer.
		 * @namespace
		 */
		var AlignedFlowLayoutRenderer = {};

		/**
		 * CSS class to be applied to the HTML root element of the control.
		 *
		 * @readonly
		 * @const {string}
		 */
		AlignedFlowLayoutRenderer.CSS_CLASS = "sapUiAFLayout";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		AlignedFlowLayoutRenderer.render = function (oRm, oControl) {
			var aContent = oControl.getContent();

			oRm.write("<ul");
			oRm.writeControlData(oControl);
			oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS);
			oRm.writeClasses();
			oRm.write(">");

			this.renderItems(oRm, oControl, aContent);
			this.renderEndItem(oRm, oControl);
			this.renderInvisibleItems(oRm, oControl, aContent.length);

			oRm.write("</ul>");
		};

		/**
		 * Renders the items, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control[]} [aContent=oControl.getContent()] The content to be rendered
		 */
		AlignedFlowLayoutRenderer.renderItems = function(oRm, oControl, aContent) {
			aContent = aContent || oControl.getContent();

			for (var i = 0; i < aContent.length; i++) {
				this.renderItem(oRm, oControl, aContent[i]);
			}
		};

		/**
		 * Renders an item, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control} oContent The content to be rendered inside the item
		 */
		AlignedFlowLayoutRenderer.renderItem = function(oRm, oControl, oContent) {
			oRm.write("<li");
			oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS + "Item");
			oRm.addStyle("flex-basis", oControl.getMinItemWidth());
			oRm.addStyle("max-width", "calc(2*" + oControl.getMinItemWidth() + ")"); // FIXME: max-width needs to be discussed, maybe optional (affects behavior when items do not even fill first row)
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.renderControl(oContent);
			oRm.write("</li>");
		};

		/**
		 * Renders the last item, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control[]} [aContent=oControl.getEndContent()] The content to be rendered inside the last item
		 */
		AlignedFlowLayoutRenderer.renderEndItem = function(oRm, oControl, aContent) {
			aContent = aContent || oControl.getEndContent();

			if (aContent.length) {
				oRm.write("<li");
				oRm.writeAttribute("id", oControl.getId() + "-endContent");
				oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS + "End");
				oRm.addStyle("flex-basis", oControl.getMinItemWidth());
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");

				for (var i = 0; i < aContent.length; i++) {
					this.renderEndContent(oRm, oControl, aContent[i]);
				}

				oRm.write("</li>");
			}
		};

		/**
		 * Renders the content of the last item, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {sap.ui.core.Control} oContent The content to be rendered inside the last item
		 */
		AlignedFlowLayoutRenderer.renderEndContent = function(oRm, oControl, oContent) {
			oRm.renderControl(oContent);
		};

		/**
		 * Renders the invisible items, using the provided {@link sap.ui.core.RenderManager}.
		 * Can be overwritten by subclasses.
		 *
		 * now do the trickful - some invisible elements...
		 * add elements to make sure the last row is "full" (has at least as many elements as the first row)
		 * - this ensures these items are not wider than the items above
		 * the highest number of elements are needed when there is just one visible element wrapped to the second row;
		 * first row has then one element less than there are children
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @param {int} iVisibleItems The number of items that should be visible
		 */
		AlignedFlowLayoutRenderer.renderInvisibleItems = function(oRm, oControl, iVisibleItems) {

			if (iVisibleItems === 0) {
				return;
			}

			// TODO: what's a reasonable value? Make it configurable?
			// But this only has an effect when all items fit into the first line and the control gets even wider.
			var sMaxWidth = "calc(2*" + oControl.getMinItemWidth() + ")";

			// We never need more than (windowWidth/minItemWidth). They just need to fill one row.
			iVisibleItems = Math.max(1, iVisibleItems - 2);
			// TODO: limit the iVisibleItems in case there are very many items. First try:
			iVisibleItems = Math.min(iVisibleItems, 100); // FIXME: magic number... let's assume there are never more than 100 items in the first row.

			for (var i = 0; i < iVisibleItems; i++) {
				oRm.write("<li");

				if (i === (iVisibleItems - 1)) {
					oRm.writeAttribute("id", oControl.getId() + "-last");
				}

				oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS + "Item");
				oRm.addClass(AlignedFlowLayoutRenderer.CSS_CLASS + "Spacer");
				oRm.addStyle("flex-basis", oControl.getMinItemWidth());
				oRm.addStyle("max-width", sMaxWidth);
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write("></li>");
			}
		};

		return AlignedFlowLayoutRenderer;
	}, /* bExport= */ true);
