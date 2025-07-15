using Microsoft.AspNetCore.Mvc;
using JsonAndXmlToDiagramVisualizer.Models;
using System.Diagnostics;
using Newtonsoft.Json;
using System.Xml.Linq;
using System.Xml;

namespace JsonAndXmlToDiagramVisualizer.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // Editor type options for JSON/XML switching
            ViewBag.editorTypes = new List<object>()
            {
                new { text = "JSON", value = "json" },
                new { text = "XML", value = "xml" }
            };

            // File operation menu items
            ViewBag.fileMenuItems = new List<object>()
            {
                new { text = "Import", id = "import", iconCss = "e-icons  e-import" },
                new { text = "Export", id = "export", iconCss = "e-icons  e-export" }
            };

            // View option menu items
            ViewBag.viewMenuItems = new List<object>()
            {
                new { text = "Show Grid", id = "view-grid", iconCss = "e-icons e-check" },
                new { text = "Item Count", id = "view-count", iconCss = "e-icons e-check" },
                new { text = "Show Expand/Collapse", id = "expand-collapse", iconCss = "e-icons e-check" }
            };

            // Theme options
            ViewBag.themeOptions = new List<object>()
            {
                new { text = "Light", id = "light", iconCss = "e-icons e-check" },
                new { text = "Dark", id = "dark", iconCss = "" }
            };

            // Toolbar items for zoom and layout controls
            ViewBag.toolbarItems = new List<Syncfusion.EJ2.Navigations.ToolbarItem>()
            {
                new Syncfusion.EJ2.Navigations.ToolbarItem { PrefixIcon = "e-icons e-reset", TooltipText = "Reset Zoom", Id = "reset", CssClass = "e-flat toolbar-btn" },
                new Syncfusion.EJ2.Navigations.ToolbarItem { PrefixIcon = "e-icons e-zoom-to-fit", TooltipText = "Fit To Page", Id = "fitToPage", CssClass = "e-flat toolbar-btn" },
                new Syncfusion.EJ2.Navigations.ToolbarItem { PrefixIcon = "e-icons e-zoom-in", TooltipText = "Zoom In", Id = "zoomIn", CssClass = "e-flat toolbar-btn" },
                new Syncfusion.EJ2.Navigations.ToolbarItem { PrefixIcon = "e-icons e-zoom-out", TooltipText = "Zoom Out", Id = "zoomOut", CssClass = "e-flat toolbar-btn" },
            };

            // Hamburger menu items
            ViewBag.hamburgerMenuItems = new List<object>(){
                new { text= "Export as Image", id= "exportImage", iconCss= "e-icons e-export" },
                new { text= "Rotate Layout", id= "rotateLayout", iconCss= "e-icons e-refresh" },
                new { text= "Collapse Graph", id= "collapseGraph", iconCss= "e-icons e-collapse-2" }
            };

            // Button models for dialogs
            ViewBag.exportButton = new { content = "Export", isPrimary = true };

            // Diagram layout settings
            ViewBag.getNodeDefaults = "getNodeDefaults";
            ViewBag.getConnectorDefaults = "getConnectorDefaults";

            return View();
        }

        [HttpPost]
        public IActionResult ConvertJsonToXml([FromBody] ConversionRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    return Json(new { success = false, message = "Content is empty" });
                }

                // Parse JSON and convert to XML 
                var xNode = JsonConvert.DeserializeXNode(request.Content, "root");
                
                if (xNode is XDocument xDoc && xDoc.Root != null)
                {
                    // Extract inner elements without the root wrapper
                    var convertedContent = string.Join("\n\n", xDoc.Root.Elements().Select(el => el.ToString()));
                    return Json(new { success = true, content = convertedContent });
                }

                return Json(new { success = false, message = "Failed to convert JSON to XML" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Conversion error: {ex.Message}" });
            }
        }

        [HttpPost]
        public IActionResult ConvertXmlToJson([FromBody] ConversionRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    return Json(new { success = false, message = "Content is empty" });
                }

                // Convert XML to JSON
                var wrappedXml = $"<root>{request.Content}</root>";
                var xmlDoc = XDocument.Parse(wrappedXml);
                var convertedContent = JsonConvert.SerializeXNode(xmlDoc, Newtonsoft.Json.Formatting.Indented, omitRootObject: true);

                return Json(new { success = true, content = convertedContent });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Conversion error: {ex.Message}" });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

    // Request models for API endpoints
    public class ConversionRequest
    {
        public string Content { get; set; } = string.Empty;
    }
}