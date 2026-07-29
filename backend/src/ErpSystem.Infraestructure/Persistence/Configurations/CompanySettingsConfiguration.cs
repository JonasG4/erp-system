using ErpSystem.Domain.Company;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Infraestructure.Persistence.Configurations;

public sealed class CompanySettingsConfiguration : IEntityTypeConfiguration<CompanySettings>
{
    public void Configure(EntityTypeBuilder<CompanySettings> builder)
    {
        builder.ToTable("CompanySettings");

        builder.HasKey(cs => cs.Id);

        builder.Property(cs => cs.BusinessName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(cs => cs.Address)
            .HasMaxLength(200);

        builder.Property(cs => cs.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(cs => cs.Email)
            .HasMaxLength(100);

        builder.Property(cs => cs.LogoUrl)
        .HasMaxLength(500);

        builder.Property(cs => cs.TaxRate)
        .HasPrecision(5, 2);

        builder.Property(cs => cs.CurrencyCode)
            .HasMaxLength(3);

        builder.Property(cs => cs.CreatedAt)
            .IsRequired();

        builder.Property(cs => cs.UpdatedAt);
    }
}
