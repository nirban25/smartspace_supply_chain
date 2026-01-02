using AutoMapper;
using Backend.Contracts.Dtos;
using Backend.Data.Data.Entities;

namespace Backend.Api.Mapping;

public sealed class EntityToDtoProfile : Profile
{
    public EntityToDtoProfile()
    {
        // node -> NodeDto
        CreateMap<node, NodeDto>()
            .ForMember(d => d.Id, m => m.MapFrom(s => s.node_id))
            .ForMember(d => d.Name, m => m.MapFrom(s => s.name))
            .ForMember(d => d.NodeType, m => m.MapFrom(s => s.node_type))
            .ForMember(d => d.DesignCapacity, m => m.MapFrom(s => s.design_capacity))
            .ForMember(d => d.Timezone, m => m.MapFrom(s => s.tz));

        // unloading_event -> UnloadingEventDto
        CreateMap<unloading_event, UnloadingEventDto>()
            .ForMember(d => d.UnloadId, m => m.MapFrom(s => s.unload_id))
            .ForMember(d => d.OperationId, m => m.MapFrom(s => s.operation_id))
            .ForMember(d => d.RailcarId, m => m.MapFrom(s => s.railcar_id))
            .ForMember(d => d.MaterialId, m => m.MapFrom(s => s.material_id))
            .ForMember(d => d.UnloadedAt, m => m.MapFrom(s => s.unloaded_at))
            .ForMember(d => d.Quantity, m => m.MapFrom(s => s.quantity))
            .ForMember(d => d.SourceRef, m => m.MapFrom(s => s.source_ref))
            .ForMember(d => d.OperationName, m => m.MapFrom(s => s.operation.name))
            .ForMember(d => d.MaterialName, m => m.MapFrom(s => s.material));

        // alert (active view) -> AlertActiveDto
        CreateMap<alert, AlertActiveDto>()
            .ForMember(d => d.AlertId, m => m.MapFrom(s => s.alert_id))
            .ForMember(d => d.Category, m => m.MapFrom(s => s.category))
            .ForMember(d => d.Severity, m => m.MapFrom(s => s.severity))
            .ForMember(d => d.NodeId, m => m.MapFrom(s => s.node_id))
            .ForMember(d => d.MaterialId, m => m.MapFrom(s => s.material_id))
            .ForMember(d => d.Message, m => m.MapFrom(s => s.message))
            .ForMember(d => d.RaisedAt, m => m.MapFrom(s => s.raised_at));

        // daily_plan -> DailyPlanDto
        CreateMap<daily_plan, DailyPlanDto>()
            .ForMember(d => d.PlanId, m => m.MapFrom(s => s.plan_id))
            .ForMember(d => d.PlanDate, m => m.MapFrom(s => s.plan_date))
            .ForMember(d => d.Version, m => m.MapFrom(s => s.version))
            .ForMember(d => d.CreatedBy, m => m.MapFrom(s => s.created_by))
            .ForMember(d => d.PublishedAt, m => m.MapFrom(s => s.published_at));

        // plan_unload -> PlanUnloadDto (adjust names to actual columns)
        CreateMap<plan_unload, PlanUnloadDto>()
            .ForMember(d => d.PlanId, m => m.MapFrom(s => s.plan_id))
            .ForMember(d => d.NodeId, m => m.MapFrom(s => s.node_id))
            .ForMember(d => d.MaterialId, m => m.MapFrom(s => s.material_id))
            .ForMember(d => d.TargetUnits, m => m.MapFrom(s => s.target_units));   // if exists

        // empty_car_release -> EmptyCarReleaseDto
        CreateMap<empty_car_release, EmptyCarReleaseDto>()
            .ForMember(d => d.ReleaseId, m => m.MapFrom(s => s.release_id))
            .ForMember(d => d.RailcarId, m => m.MapFrom(s => s.railcar_id))
            .ForMember(d => d.ReleasedTime, m => m.MapFrom(s => s.released_time))
            .ForMember(d => d.PortalTxnId, m => m.MapFrom(s => s.portal_txn_id))
            .ForMember(d => d.SourceRef, m => m.MapFrom(s => s.source_ref));

        // inventory_snapshot -> InventorySnapshotDto
        CreateMap<inventory_snapshot, InventorySnapshotDto>()
            .ForMember(d => d.SnapshotId, m => m.MapFrom(s => s.snapshot_id))
            .ForMember(d => d.NodeId, m => m.MapFrom(s => s.node_id))
            .ForMember(d => d.MaterialId, m => m.MapFrom(s => s.material_id))
            .ForMember(d => d.Quantity, m => m.MapFrom(s => s.quantity))
            .ForMember(d => d.AsOf, m => m.MapFrom(s => s.as_of));
    }
}
