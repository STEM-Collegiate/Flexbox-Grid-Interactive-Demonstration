$(document).ready(function () {
    let $activeItem = null;
    let childSizeMode = "auto"; // "auto" or "fill"

    // Save initial state for reset
    const initialState = {
        display: "block",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "stretch",
        flexboxWidth: "100%",
        itemCount: 6
    };

    // ---- FLEX ITEM SELECTION ----
    $("#flexbox").on("click", ".flex-item", function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            $activeItem = null;
            $("#selected-element").text("none");
        } else {
            $("#flexbox .flex-item").removeClass("active");
            $(this).addClass("active");
            $activeItem = $(this);
            $("#selected-element").text($(this).find("p").text());

            // Sync controls with current styles
            $("#align-self").val($(this).css("align-self") || "auto");
            $("#order").val($(this).css("order") || 0);

            let flexGrow = $(this).css("flex-grow") || 0;
            let flexShrink = $(this).css("flex-shrink") || 1;
            $("#flex-grow").val(flexGrow);
            $("#flex-grow-value").text(flexGrow);
            $("#flex-shrink").val(flexShrink);
            $("#flex-shrink-value").text(flexShrink);

            let flexVal = $(this).css("flex") === "1 1 0%" ? "1" : "0";
            $(`input[name='flex'][value='${flexVal}']`).prop("checked", true);
        }
    });

    // ---- FLEXBOX CONTAINER CONTROLS ----
    $("#display-type").on("change", function () {
        $("#flexbox").css("display", $(this).is(":checked") ? "flex" : "block");
    });

    $("#flex-direction").on("change", function () {
        $("#flexbox").css("flex-direction", $(this).val());
    });

    $("#justify-content").on("change", function () {
        $("#flexbox").css("justify-content", $(this).val());
    });

    $("#align-items").on("change", function () {
        $("#flexbox").css("align-items", $(this).val());
    });

    $("#flexbox-width").on("input", function () {
        let value = $(this).val() + "%";
        $("#flexbox").css("width", value);
        $("#flexbox-width-value").text(value);
    });

    // ---- FLEX ITEM SELF CONTROLS ----
    $("#align-self").on("change", function () {
        if ($activeItem) $activeItem.css("align-self", $(this).val());
    });

    $("#order").on("input", function () {
        if ($activeItem) $activeItem.css("order", $(this).val());
    });

    $("input[name='flex']").on("change", function () {
        if ($activeItem) $activeItem.css("flex", $(this).val());
    });

    $("#flex-grow").on("input", function () {
        let val = $(this).val();
        $("#flex-grow-value").text(val);
        if ($activeItem) $activeItem.css("flex-grow", val);
    });

    $("#flex-shrink").on("input", function () {
        let val = $(this).val();
        $("#flex-shrink-value").text(val);
        if ($activeItem) $activeItem.css("flex-shrink", val);
    });

    // ---- DYNAMIC ITEM COUNT ----
    $("#item-count").on("input", function () {
        let count = parseInt($(this).val());
        $("#item-count-value").text(count);

        let $flexbox = $("#flexbox");
        let currentCount = $flexbox.children(".flex-item").length;

        if (count > currentCount) {
            for (let i = currentCount + 1; i <= count; i++) {
                $flexbox.append(`<div class="flex-item"><p>Item ${i}</p></div>`);
            }
        } else if (count < currentCount) {
            $flexbox.children(".flex-item").slice(count).remove();
            if ($activeItem && $activeItem.index() >= count) {
                $activeItem = null;
                $("#selected-element").text("none");
                $("#flexbox .flex-item").removeClass("active");
            }
        }
    });

    // ---- RESET BUTTON ----
    $("#reset").on("click", function () {
        // Reset flexbox container styles
        $("#flexbox").css({
            display: initialState.display,
            flexDirection: initialState.flexDirection,
            justifyContent: initialState.justifyContent,
            alignItems: initialState.alignItems,
            width: initialState.flexboxWidth
        });

        // Reset flexbox container controls
        $("#display-type").prop("checked", false);
        $("#flex-direction").val(initialState.flexDirection);
        $("#justify-content").val(initialState.justifyContent);
        $("#align-items").val(initialState.alignItems);
        $("#flexbox-width").val(parseInt(initialState.flexboxWidth));
        $("#flexbox-width-value").text(initialState.flexboxWidth);

        // Reset number of items
        $("#item-count").val(initialState.itemCount);
        $("#item-count-value").text(initialState.itemCount);

        let $flexbox = $("#flexbox");
        $flexbox.empty();
        for (let i = 1; i <= initialState.itemCount; i++) {
            $flexbox.append(`<div class="flex-item"><p>Item ${i}</p></div>`);
        }

        // Reset selected element
        $activeItem = null;
        $("#selected-element").text("none");
        $("#flexbox .flex-item").removeClass("active");

        // Reset per-item controls
        $("#align-self").val("auto");
        $("#order").val(0);
        $("#flex-grow").val(0);
        $("#flex-grow-value").text(0);
        $("#flex-shrink").val(1);
        $("#flex-shrink-value").text(1);
        $("input[name='flex'][value='0']").prop("checked", true);
    });

    // ---- UPDATE CSS OUTPUT ----
    function updateCssOutput() {
        let containerCss = $("#flexbox").attr("style") || "";
        let output = `#flexbox {\n`;

        // Format container CSS
        containerCss.split(";").forEach(rule => {
            if (rule.trim() !== "") {
                output += "  " + rule.trim() + ";\n";
            }
        });
        output += `}\n\n`;
        if (childSizeMode === "fill") {
            output += `.flex-item {\n  width: 100%;\n  height: 100%;\n}\n\n`;
        }
        // Go through every flex item and print its styles if any
        $("#flexbox .flex-item").each(function () {
            let id = $(this).attr("id");
            let itemCss = $(this).attr("style") || "";
            if (itemCss.trim() !== "") {
                output += `#${id} {\n`;
                itemCss.split(";").forEach(rule => {
                    if (rule.trim() !== "") {
                        output += "  " + rule.trim() + ";\n";
                    }
                });
                output += `}\n\n`;
            }
        });

        $("#css-output").text(output.trim());
    }

    // Call updater after every control interaction
    $("input, select, #reset").on("input change click", updateCssOutput);

    // Initial call
    updateCssOutput();

    // ---- DYNAMIC ITEM COUNT ----
    $("#item-count").on("input", function () {
        let count = parseInt($(this).val());
        $("#item-count-value").text(count);

        let $flexbox = $("#flexbox");
        let currentCount = $flexbox.children(".flex-item").length;

        if (count > currentCount) {
            for (let i = currentCount + 1; i <= count; i++) {
                $flexbox.append(`<div class="flex-item" id="item${i}"><p>Item ${i}</p></div>`);
            }
        } else if (count < currentCount) {
            $flexbox.children(".flex-item").slice(count).remove();
            if ($activeItem && $activeItem.index() >= count) {
                $activeItem = null;
                $("#selected-element").text("none");
                $("#flexbox .flex-item").removeClass("active");
            }
        }

        updateCssOutput();
    });

    // ---- TOGGLE CODE PANEL ----
    $("#toggle-code").on("click", function () {
        let $panel = $("#demo");

        if ($panel.hasClass("hide-code")) {
            $panel.removeClass("hide-code").addClass("show-code");
            $(this).text("Hide Code");
        } else {
            $panel.removeClass("show-code").addClass("hide-code");
            $(this).text("Show Code");
        }
    });

    $("input[name='child-size']").on("change", function () {
        childSizeMode = $(this).val();

        if (childSizeMode === "fill") {
            // Apply directly to the elements
            $(".flex-item").addClass("fill");
        } else {
            // Reset back to auto sizing
            $(".flex-item").removeClass("fill");
        }

        updateCssOutput();
    });

});
