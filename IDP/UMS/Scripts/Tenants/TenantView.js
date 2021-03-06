﻿var isFirstLoad = true;
var tenantItemTypes = [];
var tenantItemSubTypes = [];
var tenantActions = [];

$(function () {
    $("#plan-upgrade-confirm-dialog").ejDialog({
        allowDraggable: false,
        enableResize: false,
        enableModal: true,
        showHeader: false,
        title: "Tenant",
        closeOnEscape: true,
        showOnInit: false,
        close: "onUpgradeDialogClose",
        open: "onUpgradeDialogOpen",
        width: (window.innerWidth > 460) ? "450px" : (window.innerWidth - 10)
    });

    $("#plan-upgrade-confirm-dialog_wrapper").ejWaitingPopup();

    var queryTab = getQueryVariable("view");
    if (queryTab !== null) {
        switch (queryTab) {
            case "general":
                $("li#info a").click();
                break;
            case "plan":
            case "payment":
            case "log":
            case "activity":
            case "resources":
                $("li#" + queryTab + " a").click();
                break;
        }
    }
});

$(document).on("click", "#plan-tab-ref", function (e) {
    $(".tab-area #ad-tab-nav li").removeClass("active");
    $(".tab-area #ad-tab-nav #plan").addClass("active");
    $("#tenant-plan-tab").show();
});


$(document).on('click', '#plan-upgrade-button', function (e) {
    $("#tenant-plan-tab").hide();
    $("#license-setting-header").hide();
    $("#plan-detail-dialog").show();
});

$(document).on("click", ".popup-close", function () {
    onUpgradeDialogClose();
});

$(document).on("click", "#plan-upgrade-confirm", function (e) {
    var planId = $(this).attr("data-plan-id");
    var tenantId = $(this).attr("data-tenant-id");
    $("#plan-upgrade-confirm-dialog_wrapper").ejWaitingPopup("show");
    $.ajax({
        type: "POST",
        url: planUpgardeUrl,
        data: { tenantId: tenantId, planId: planId },
        success: function (data) {
            if (data.Success) {
                onUpgradeDialogClose();
                SuccessAlert("Plan Upgraded", "Plan has been upgraded successfully.", 7000);
            }
            else {
                $("#plan-upgrade-confirm-dialog .plan-upgrade-process").hide();
                $("#plan-upgrade-confirm-dialog .plan-upgrade-status").show();
            }
            $("#plan-upgrade-confirm-dialog_wrapper").ejWaitingPopup("hide");
        }
    });
});

$(document).on('click', '.upgrade-plan', function (e) {
    var planId = $(this).attr("data-plan-id");
    var planName = $(this).attr("data-plan-name");
    $("#plan-upgrade-confirm-dialog .plan-name").html(planName);

    $("#plan-upgrade-confirm").attr("data-plan-id", planId);
    $("#plan-upgrade-confirm-dialog").ejDialog("open");
});

$(document).on('click', '#ad-tab-nav li a', function (e) {
    $("#tenant-plan-tab").hide();
    $("#plan-detail-dialog").hide();
    popupDisplay(false);
    $("#refresh-resources").css("display", "none");
});

$(document).on('click', '#plan-close', function (e) {
    $("#tenant-plan-tab").show();
    $("#plan-detail-dialog").hide();
});

$(document).on('click', '#ad-tab-nav #plan', function (e) {
    $("#tenant-plan-tab").show();
});

$(document).on('click', '#ad-tab-nav #resources a', function (e) {
    if (isFirstLoad) {
        fillTenantInfo();
        isFirstLoad = false;
    }

    $("#refresh-resources").css("display", "block");
});

function onUpgradeDialogClose() {
    $("#plan-upgrade-confirm-dialog .plan-upgrade-process").show();
    $("#plan-upgrade-confirm-dialog .plan-upgrade-status").hide();
    $("#plan-upgrade-confirm-dialog").ejDialog("close");
}

function fnPaymentLogs(args) {
    var tenantId = $("#payment-tenant-info-id").attr("data-tenant-info-id");
    this.model.query._params.push({ key: "tenantId", value: tenantId });
}

function fillTenantInfo() {
    var tenantId = $("#payment-tenant-info-id").attr("data-tenant-info-id");
    popupDisplay(true);
    $.ajax({
        type: "POST",
        url: tenantInfoUrl,
        data: { tenantId: tenantId },
        success: function (data) {
            popupDisplay(false);
            if (data.status) {
                var tenantInfo = data.result;
                var domain = "http://" + $(".page-title").html();
                var imageBaseUrl = domain + "/bi/content/images/application/";
                $("#active-users-value").html(tenantInfo.Users.ActiveUsersCount);
                $("#inactive-users-value").html(tenantInfo.Users.InActiveUsersCount);
                $("#deleted-users-value").html(tenantInfo.Users.DeletedUsersCount);
                $("#azure-users-value").html(tenantInfo.Users.AzureUsersCount);
                $("#db-users-value").html(tenantInfo.Users.DatabaseUsersCount);
                $("#active-groups-value").html(tenantInfo.Groups.ActiveGroupsCount);
                $("#azure-groups-value").html(tenantInfo.Groups.AzureGroupsCount);
                $("#dashboards-value").html(tenantInfo.Resources.ActiveDashboardsCount);
                $("#drafts-value").html(tenantInfo.Resources.DraftsCount);
                $("#public-dashboards-value").html(tenantInfo.Resources.PublicDashboardsCount);
                $("#datasources-value").html(tenantInfo.Resources.DataSourcesCount);
                $("#live-datasources-value").html(tenantInfo.DataSourceTypes.LiveDatasourcesCount);
                $("#extract-datasources-value").html(tenantInfo.DataSourceTypes.ExtractDatasourcesCount);
                $("#schedules-value").html(tenantInfo.Resources.SchedulesCount);
                $("#app-name-value").html(tenantInfo.Branding.AppName);
                $("#app-logo-value").attr("src", imageBaseUrl + tenantInfo.Branding.AppLogoUrl);
                $("#email-logo-value").attr("src", imageBaseUrl + tenantInfo.Branding.EmailLogoUrl);
                $("#favicon-value").attr("src", imageBaseUrl + tenantInfo.Branding.FaviconUrl);                
                renderTenantActivity(tenantInfo.TenantActivity);

                var tag = "<div class='row'> <div class='row-header'><span>Custom Branding</span></div>";
                tag += "<div class='single-card-info col-xs-12 no-padding'><div class='inner-card-info'><div class='header'>Enabled</div><div class='details-div no-padding'><span class='single-detail-value no-padding'>" + tenantInfo.Branding.IsCustomBrandingEnabled + "</span></div></div></div>";
                tag += "<div class='single-card-info app-name-info col-xs-12 no-padding'><div class='inner-card-info'><div class='header'>App name</div><div class='details-div no-padding'><span class='single-detail-value no-padding'>" + tenantInfo.Branding.AppName + "</span></div></div></div>";
                tag += "<div class='single-card-info col-xs-12 no-padding'><div class='inner-card-info'><div class='header'>EnableCopyrightInfo</div><div class='details-div no-padding'><span class='single-detail-value no-padding'>" + tenantInfo.Branding.IsEnableCopyrightInfo + "</span></div></div></div>";
                tag += "<div class='single-card-info col-xs-12 no-padding'><div class='inner-card-info'><div class='header'>EnablePoweredBySyncfusion</div><div class='details-div no-padding'><span class='single-detail-value no-padding'>" + tenantInfo.Branding.IsEnablePoweredBySyncfusion + "</span></div></div></div>";
                tag += "</div>";
                $(".custom-branding-div").html(tag);
            } else {
                clearResourcesElements();
            }
        }
    });
}

function popupDisplay(data) {
    if (data) {
        $("#users-count").ejWaitingPopup();
        $("#users-count").ejWaitingPopup("show");
        $("#groups-count").ejWaitingPopup();
        $("#groups-count").ejWaitingPopup("show");
        $("#dashboards-count").ejWaitingPopup();
        $("#dashboards-count").ejWaitingPopup("show");
        $("#datasources-count").ejWaitingPopup();
        $("#datasources-count").ejWaitingPopup("show");
        $("#schedules-count").ejWaitingPopup();
        $("#schedules-count").ejWaitingPopup("show");
    } else {
        if ($("#users-count_WaitingPopup").css("display") === "block") {
            $("#users-count").ejWaitingPopup("hide");
        }
        if ($("#groups-count_WaitingPopup").css("display") === "block") {
            $("#groups-count").ejWaitingPopup("hide");
        }
        if ($("#dashboards-count_WaitingPopup").css("display") === "block") {
            $("#dashboards-count").ejWaitingPopup("hide");
        }
        if ($("#datasources-count_WaitingPopup").css("display") === "block") {
            $("#datasources-count").ejWaitingPopup("hide");
        }
        if ($("#schedules-count_WaitingPopup").css("display") === "block") {
            $("#schedules-count").ejWaitingPopup("hide");
        }
    }
}

function clearResourcesElements() {
    popupDisplay(false);
    $("#active-users-value").html("");
    $("#inactive-users-value").html("");
    $("#deleted-users-value").html("");
    $("#active-groups-value").html("");
    $("#dashboards-value").html("");
    $("#drafts-value").html("");
    $("#public-dashboards-value").html("");
    $("#datasources-value").html("");
    $("#schedules-value").html("");
    $("#app-name-value").html("");
    $("#app-logo-value").attr("src", "");
    $("#email-logo-value").attr("src", "");
    $("#favicon-value").attr("src", "");
}

$(document).on('click', '#refresh-resources span', function (e) {
    fillTenantInfo();
});

function renderTenantActivity(data) {
    var tag = "";

    for (var i = 0; i < data.length; i++) {
        if (tenantItemTypes.indexOf(data[i].ItemType) === -1) {
            tenantItemTypes = tenantItemTypes.concat(data[i].ItemType);
        }
    }
    
    for (var i = 0; i < tenantItemTypes.length; i++) {
        tag += "<div class='tenant-activty-types col-xs-6'> <div class='row-header'><span>" + tenantItemTypes[i] + "</span></div>";
        tenantItemSubTypes = [];
        tenantActions = [];
        for (var j = 0; j < data.length; j++) {
            if (tenantItemTypes[i] === data[j].ItemType && tenantItemSubTypes.indexOf(data[j].ItemSubType) === -1) {
                tenantItemSubTypes = tenantItemSubTypes.concat(data[j].ItemSubType);
            }
        }

        tag += "<div class='item-table-div'><table><tr><th>ItemSubType</th>";
        for (var j = 0; j < data.length; j++) {
            if (tenantItemTypes[i] === data[j].ItemType && tenantActions.indexOf(data[j].Action) === -1) {
                tenantActions = tenantActions.concat(data[j].Action);
                tag += "<th>" + data[j].Action + "</th>";
            }
        }
        tag += "</tr>";

        for (var j = 0; j < tenantItemSubTypes.length; j++) {
            tag += "<tr><td>" + tenantItemSubTypes[j] + "</td>";
            for (var k = 0; k < tenantActions.length; k++) {
                var countTag = "";
                for (var x = 0; x < data.length; x++) {
                    if (data[x].ItemSubType === tenantItemSubTypes[j] && data[x].Action === tenantActions[k]) {
                        countTag = "<td>" + data[x].Count + "</td>";
                    }
                }
                tag += (countTag === "" ? "<td>0</td>" : countTag);
            }
            tag += "</tr>";
        }

        tag += "</table></div></div>";
    }
    
    $(".tenant-activty-types-div").html(tag);
}