using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Infraestructure.Persistence;

public static class DependecyInjection
{
    public static IServiceCollection AddInfraestructure(
        this IServiceCollection services,
        string connectionString
    ) =>
        services.AddDbContext<ErpSystemDbContext>(options =>
            options.UseNpgsql(connectionString)
        );
}
