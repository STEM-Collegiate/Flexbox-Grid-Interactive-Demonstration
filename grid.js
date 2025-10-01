$(function () {
    let $activeItem = null;
    const initialState = { colCount: 3, rowCount: 0, gap: 10, itemCount: 6 };



    // Build column/row inputs
    function buildInputs(type, count, containerId) {
        let $c = $(containerId).empty();
        for (let i = 1; i <= count; i++) {
            $c.append(`
        <div>
          <label>${type} ${i}:</label>
          <input type="number" class="${type}-size" data-index="${i}" value="1" min="1">
          <select class="${type}-unit" data-index="${i}">
            <option value="fr" selected>fr</option>
            <option value="px">px</option>
            <option value="%">%</option>
            <option value="pt">pt</option>
          </select>
        </div>`);
        }
    }

    // Update grid styles
    function updateGrid() {
        if (!$("#display-grid").is(":checked")) {
            updateCssOutput();
            return;
        }

        // Columns
        let colCount = parseInt($("#col-count").val());
        let cols = [];
        for (let i = 1; i <= colCount; i++) {
            let size = $(`.Column-size[data-index=${i}]`).val() || 1;
            let unit = $(`.Column-unit[data-index=${i}]`).val() || "fr";
            cols.push(size + unit);
        }
        $("#gridbox").css("grid-template-columns", cols.join(" "));

        // Rows
        let rowCount = parseInt($("#row-count").val());
        if (rowCount > 0) {
            let rows = [];
            for (let i = 1; i <= rowCount; i++) {
                let size = $(`.Row-size[data-index=${i}]`).val() || 1;
                let unit = $(`.Row-unit[data-index=${i}]`).val() || "fr";
                rows.push(size + unit);
            }
            $("#gridbox").css("grid-template-rows", rows.join(" "));
        } else {
            $("#gridbox").css("grid-template-rows", "");
        }

        $("#gridbox").css("grid-auto-flow", $("#auto-flow").val());
        $("#gridbox").css("gap", $("#gap").val() + "px");

        updateCssOutput();
    }


    // Update CSS output
    function updateCssOutput() {
        let containerCss = $("#gridbox").attr("style") || "";
        let output = "#gridbox {\n";
        containerCss.split(";").forEach(r => {
            if (r.trim() !== "") { output += "  " + r.trim() + ";\n"; }
        });
        output += "}\n\n";

        // Go through every grid item and print its styles if any (excluding defaults)
        $("#gridbox .grid-item").each(function () {
            let id = $(this).attr("id");
            let itemCss = $(this).attr("style") || "";

            // Parse inline style rules into key/value pairs
            let rules = itemCss.split(";").map(r => r.trim()).filter(r => r !== "");
            let filtered = [];

            rules.forEach(rule => {


                // skip empty or default grid values
                if (rule === "grid-column: auto" || rule === "grid-row: auto") return;

                filtered.push(rule);
            });

            // Only output if the item has meaningful overrides
            if (filtered.length > 0) {
                output += `#${id} {\n`;
                filtered.forEach(r => {
                    output += "  " + r + ";\n";
                });
                output += "}\n\n";
            }
        });


        $("#css-output").text(output.trim());
    }

    // Select items
    // ---- ITEM SELECTION ----
    $("#gridbox").on("click", ".grid-item", function () {
        let $this = $(this);

        if ($this.attr("id") === "active") {
            // Deactivate currently active item
            let originalId = $this.data("original-id");
            $this.attr("id", originalId).removeClass("active");
            $this.removeData("original-id");
            $activeItem = null;
            $("#selected-element").text("none");
        } else {
            // Deactivate any currently active item
            let $currentActive = $("#gridbox #active");
            if ($currentActive.length) {
                let originalId = $currentActive.data("original-id");
                $currentActive.attr("id", originalId).removeClass("active");
                $currentActive.removeData("original-id");
            }

            // Activate this item
            let oldId = $this.attr("id");
            $this.data("original-id", oldId);
            $this.attr("id", "active").addClass("active");
            $activeItem = $this;
            $("#selected-element").text(oldId);
        }

        updateCssOutput();
    });


    // Item controls
    $("#col-start, #col-span, #row-start, #row-span").on("input", function () {
        if (!$activeItem) return;
        let cs = $("#col-start").val(),
            ce = $("#col-span").val(),
            rs = $("#row-start").val(),
            re = $("#row-span").val();
        $("#col-start-value").text(cs);
        $("#col-span-value").text(ce);
        $("#row-start-value").text(rs);
        $("#row-span-value").text(re);

        let styles = {};

        // Column settings
        if (cs > 0 && ce > 0) {
            styles["grid-column"] = `${cs} / span ${ce}`;
        } else if (cs > 0 && ce == 0) {
            styles["grid-column-start"] = cs;
        } else if (cs == 0 && ce > 0) {
            styles["grid-column"] = `span ${ce}`;
        } else {
            styles["grid-column"] = "";
        }

        // Row settings
        if (rs > 0 && re > 0) {
            styles["grid-row"] = `${rs} / span ${re}`;
        } else if (rs > 0 && re == 0) {
            styles["grid-row-start"] = rs;
        } else if (rs == 0 && re > 0) {
            styles["grid-row"] = `span ${re}`;
        } else {
            styles["grid-row"] = "";
        }

        $activeItem.css(styles);
        updateCssOutput();

        updateCssOutput();
    });

    // Column/Row slider build
    $("#col-count").on("input", function () {
        $("#col-count-value").text($(this).val());
        buildInputs("Column", $(this).val(), "#col-inputs");
        updateGrid();
    });
    $("#row-count").on("input", function () {
        $("#row-count-value").text($(this).val());
        buildInputs("Row", $(this).val(), "#row-inputs");
        updateGrid();
    });

    // Gap
    $("#gap").on("input", function () {
        $("#gap-value").text($(this).val());
        updateGrid();
    });

    // Item count
    $("#item-count").on("input", function () {
        let c = parseInt($(this).val());
        $("#item-count-value").text(c);
        let $box = $("#gridbox").empty();
        for (let i = 1; i <= c; i++) {
            $box.append(`<div class="grid-item" id="item${i}"><p>Item ${i}</p></div>`);
        }
        updateCssOutput();
    });

    // Reset
    $("#reset").on("click", function () {
        $("#display-grid").prop("checked", false);
        $("#col-count").val(initialState.colCount).trigger("input");
        $("#row-count").val(initialState.rowCount).trigger("input");
        $("#gap").val(initialState.gap).trigger("input");
        $("#item-count").val(initialState.itemCount).trigger("input");
        $("#selected-element").text("none");
        $activeItem = null;
    });

    // Toggle code panel
    $("#toggle-code").on("click", function () {
        let $p = $("#demo");
        if ($p.hasClass("hide-code")) {
            $p.removeClass("hide-code").addClass("show-code");
            $(this).text("Hide Code");
        } else {
            $p.removeClass("show-code").addClass("hide-code");
            $(this).text("Show Code");
        }
    });

    // Init
    $("#col-count").trigger("input");
    $("#row-count").trigger("input");
    $("#item-count").trigger("input");
    // ---- GRID DISPLAY TOGGLE ----
    $("#display-grid").on("change", function () {
        if ($(this).is(":checked")) {
            $("#gridbox").css("display", "grid");
        } else {
            $("#gridbox").css("display", "block");
        }
        updateGrid(); // <-- force update immediately
    });

    // Rebind events whenever inputs are rebuilt
    function bindTrackInputs() {
        $("#col-inputs").on("input change", ".Column-size, .Column-unit", updateGrid);
        $("#row-inputs").on("input change", ".Row-size, .Row-unit", updateGrid);
    }

    function buildInputs(type, count, containerId) {
        let $c = $(containerId).empty();
        for (let i = 1; i <= count; i++) {
            $c.append(`
      <div>
        <label>${type} ${i}:</label>
        <input type="number" class="${type}-size" data-index="${i}" value="1" min="1">
        <select class="${type}-unit" data-index="${i}">
          <option value="fr" selected>fr</option>
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="pt">pt</option>
        </select>
      </div>`);
        }
        bindTrackInputs();
    }


});
