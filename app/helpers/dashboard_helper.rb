module DashboardHelper
    def format_date(date)
        date.strftime("%A %B %d, %Y at %H : %M")
    end
end
