using System;
using System.Collections.Generic;
using Backend.Data.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Data
{
    public partial class SupplyChainDbContext : DbContext
    {
        public SupplyChainDbContext(DbContextOptions<SupplyChainDbContext> options) : base(options)
        {
        }

        // ✅ DbSets for tables
        public virtual DbSet<alert> Alerts { get; set; }
        public virtual DbSet<alert_category> AlertCategories { get; set; }
        public virtual DbSet<alert_severity> AlertSeverities { get; set; }
        public virtual DbSet<audit_event> AuditEvents { get; set; }
        public virtual DbSet<daily_plan> DailyPlans { get; set; }
        public virtual DbSet<empty_car_release> EmptyCarReleases { get; set; }
        public virtual DbSet<inventory_snapshot> InventorySnapshots { get; set; }
        public virtual DbSet<material> Materials { get; set; }
        public virtual DbSet<material_design_limit> MaterialDesignLimits { get; set; }
        public virtual DbSet<node> Nodes { get; set; }
        public virtual DbSet<node_type> NodeTypes { get; set; }
        public virtual DbSet<operation> Operations { get; set; }
        public virtual DbSet<plan_unload> PlanUnloads { get; set; }
        public virtual DbSet<railcar> Railcars { get; set; }
        public virtual DbSet<railcar_movement> RailcarMovements { get; set; }
        public virtual DbSet<silo> Silos { get; set; }
        public virtual DbSet<silo_material_capacity> SiloMaterialCapacities { get; set; }
        public virtual DbSet<staging_attachment> StagingAttachments { get; set; }
        public virtual DbSet<staging_email> StagingEmails { get; set; }
        public virtual DbSet<staging_row> StagingRows { get; set; }
        public virtual DbSet<supplier> Suppliers { get; set; }
        public virtual DbSet<system_parameter> SystemParameters { get; set; }
        public virtual DbSet<unloading_event> UnloadingEvents { get; set; }
        public virtual DbSet<user> Users { get; set; } = default!;

        // ✅ DbSets for views (keyless)
        public virtual DbSet<mv_current_inventory> MvCurrentInventories { get; set; }
        public virtual DbSet<mv_daily_receipt> MvDailyReceipts { get; set; }
        public virtual DbSet<mv_release_vs_unload> MvReleaseVsUnloads { get; set; }
        public virtual DbSet<v_plan_compliance> VPlanCompliances { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // PostgreSQL extension for UUID generation
            modelBuilder.HasPostgresExtension("pgcrypto");

            // ✅ Table mappings
            modelBuilder.Entity<user>(entity =>
                {
                    entity.HasKey(e => e.user_id).HasName("users_pkey");
                    entity.Property(e => e.user_id).HasDefaultValueSql("gen_random_uuid()");
                    entity.Property(e => e.username).IsRequired();
                    entity.Property(e => e.email).IsRequired();
                    entity.Property(e => e.password_hash).IsRequired();
                    entity.HasIndex(e => e.username).IsUnique();
                    entity.HasIndex(e => e.email).IsUnique();
                });

            modelBuilder.Entity<alert>(entity =>
            {
                entity.HasKey(e => e.alert_id).HasName("alerts_pkey");
                entity.Property(e => e.alert_id).HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<daily_plan>(entity =>
            {
                entity.HasKey(e => e.plan_id).HasName("daily_plans_pkey");
                entity.Property(e => e.plan_id).HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<empty_car_release>(entity =>
            {
                entity.HasKey(e => e.release_id).HasName("empty_car_releases_pkey");
                entity.Property(e => e.release_id).HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<inventory_snapshot>(entity =>
            {
                entity.HasKey(e => e.snapshot_id).HasName("inventory_snapshots_pkey");
                entity.Property(e => e.snapshot_id).HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<material>(entity =>
            {
                entity.HasKey(e => e.material_id).HasName("materials_pkey");
                entity.Property(e => e.material_id).HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<node>(entity =>
            {
                entity.HasKey(e => e.node_id).HasName("nodes_pkey");
                entity.Property(e => e.node_id).HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<operation>(entity =>
            {
                entity.HasKey(e => e.operation_id).HasName("operations_pkey");
                entity.Property(e => e.operation_id).HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<railcar>(entity =>
            {
                entity.HasKey(e => e.railcar_id).HasName("railcars_pkey");
            });

            modelBuilder.Entity<plan_unload>(entity =>
            {
                entity.ToTable("plan_unloads");
                entity.HasKey(e => new { e.plan_id, e.node_id, e.material_id }).HasName("plan_unloads_pkey");
            });

            // ✅ Views must be keyless
            modelBuilder.Entity<mv_current_inventory>().HasNoKey().ToView("mv_current_inventory");
            modelBuilder.Entity<mv_daily_receipt>().HasNoKey().ToView("mv_daily_receipts");
            modelBuilder.Entity<mv_release_vs_unload>().HasNoKey().ToView("mv_release_vs_unload");
            modelBuilder.Entity<v_plan_compliance>().HasNoKey().ToView("v_plan_compliance");

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
