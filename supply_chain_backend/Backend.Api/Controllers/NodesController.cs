// using Backend.Data.Data;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Api.Controllers
// {
//     [ApiController]
//     [Route("api/nodes")]
//     public class NodesController : ControllerBase
//     {
//         private readonly SupplyChainDbContext _db;
//         public NodesController(SupplyChainDbContext db) => _db = db;

//         [HttpGet]
//         public async Task<IActionResult> GetAll() => Ok(await _db.Nodes.ToListAsync());
//     }
// }



using AutoMapper;
using AutoMapper.QueryableExtensions;
using Backend.Contracts.Dtos;
using Backend.Data.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/nodes")]
    public class NodesController : ControllerBase
    {
        private readonly SupplyChainDbContext _db;
        private readonly IMapper _mapper;

        public NodesController(SupplyChainDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _db.Nodes
                .ProjectTo<NodeDto>(_mapper.ConfigurationProvider)
                .OrderBy(n => n.Name)
                .ToListAsync();

            return Ok(items);
        }
    }
}
