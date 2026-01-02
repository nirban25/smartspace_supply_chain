
using System;
using System.Threading.Tasks;
using Backend.Contracts.Dtos;

namespace Backend.Contracts.Interfaces
{
    public interface IPlanRepository
    {
        Task<DailyPlanDto?> GetPlanAsync(DateOnly date, int version);
        Task<PlanWithUnloadsDto?> GetPlanWithUnloadsAsync(DateOnly date, int version);
    }
}
