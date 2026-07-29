using ErpSystem.Domain.Common;

namespace ErpSystem.Domain.Company;

public sealed class CompanySettings : AuditableEntity
{
    public string BusinessName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public decimal TaxRate { get; set; } = 0.13m;
    public Theme Theme { get; set; } = Theme.System;
}
