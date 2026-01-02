using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Contracts.Dtos;                 // DTOs live in Contracts
using Backend.Contracts.Interfaces;          // Interface lives in Contracts
using Backend.Data.Data;                     // DbContext
using Backend.Data.Data.Entities;            // EF entities
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Repositories.Implementations
{
    public sealed class PlanRepository : IPlanRepository
    {
        private readonly SupplyChainDbContext _db;
        public PlanRepository(SupplyChainDbContext db) => _db = db;

        public async Task<DailyPlanDto?> GetPlanAsync(DateOnly date, int version)
        {
            var plan = await _db.DailyPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.plan_date == date && p.version == version);

            if (plan is null) return null;

            // Map entity -> DTO
            return new DailyPlanDto
            {
                PlanId = plan.plan_id,
                PlanDate = plan.plan_date,
                Version = plan.version,
                CreatedBy = plan.created_by,
                PublishedAt = plan.published_at
            };
        }

        public async Task<PlanWithUnloadsDto?> GetPlanWithUnloadsAsync(DateOnly date, int version)
        {
            // First, get the plan as entity (efficient to look up unloads)
            var plan = await _db.DailyPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.plan_date == date && p.version == version);

            if (plan is null) return null;

            // Map plan to DTO
            var planDto = new DailyPlanDto
            {
                PlanId = plan.plan_id,
                PlanDate = plan.plan_date,
                Version = plan.version,
                CreatedBy = plan.created_by,
                PublishedAt = plan.published_at
            };

            // Fetch related unloads and map each to DTO

            var unloadDtos = await _db.PlanUnloads
                    .AsNoTracking()
                    .Where(u => u.plan_id == plan.plan_id)
                    .Select(u => new PlanUnloadDto
                    {
                        PlanId = u.plan_id,
                        NodeId = u.node_id,
                        MaterialId = u.material_id,
                        TargetUnits = u.target_units
                    })
                    .ToListAsync();

            return new PlanWithUnloadsDto
            {
                Plan = planDto,
                Unloads = unloadDtos
            };
        }
    }
}
