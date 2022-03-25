const adminDashboardServices = require('../services/admindashboard/admindashboardservice');

exports.routes = function(app) {
    app.post('/dashboardcartdata',adminDashboardServices.dashboardData);
    app.post('/dashboardsubscriberscartdata',adminDashboardServices.dashboardSubricibersData);
    app.post('/dashboardfleetdata',adminDashboardServices.dashboardFleetsData);
    app.post('/dashboardlinechartdata',adminDashboardServices.dashboardLineChartData);
}