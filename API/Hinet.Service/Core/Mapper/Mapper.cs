using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Expressions;

namespace Hinet.Service.Core.Mapper
{

    //public class Mapper : IMapper
    //{
    //    private static readonly Dictionary<(Type sourceType, Type destType), Action<object, object>> _emittedMappers
    //        = new Dictionary<(Type sourceType, Type destType), Action<object, object>>();
    //    private static readonly object _objecLock = new object();


    //    private static readonly Dictionary<Type, Func<object>> _instanceCreators
    //     = new Dictionary<Type, Func<object>>();
    //    private static readonly object _instanceLock = new object();

    //    public TDestination Map<TSource, TDestination>(TSource source)
    //    {
    //        var destination = CreateInstance<TDestination>();
    //        return MapObject(source, destination);
    //    }

    //    public TDestination Map<TSource, TDestination>(TSource source, TDestination destination)
    //    {
    //        if (destination == null)
    //        {
    //            destination = CreateInstance<TDestination>();
    //        }


    //        return MapObject(source, destination);
    //    }

    //    private TDestination CreateInstance<TDestination>()
    //    {
    //        var destType = typeof(TDestination);

    //        if (!_instanceCreators.TryGetValue(destType, out var creator))
    //        {
    //            lock (_instanceLock)
    //            {
    //                if (!_instanceCreators.TryGetValue(destType, out creator))
    //                {
    //                    var newExpr = Expression.New(destType);
    //                    var lambdaExpr = Expression.Lambda<Func<object>>(
    //                        Expression.Convert(newExpr, typeof(object))
    //                    );
    //                    creator = lambdaExpr.Compile();
    //                    _instanceCreators[destType] = creator;
    //                }
    //            }
    //        }

    //        return (TDestination)creator();
    //    }

    //    private TDestination MapObject<TSource, TDestination>(TSource source, TDestination destination)
    //    {
    //        var sourceType = typeof(TSource);
    //        var destType = typeof(TDestination);
    //        var key = (sourceType, destType);

    //        if (!_emittedMappers.TryGetValue(key, out var _mapper))
    //        {
    //            lock (_objecLock)
    //            {
    //                if (!_emittedMappers.TryGetValue(key, out _mapper))
    //                {
    //                    var assemblyName = new AssemblyName($"DynamicMapper_{sourceType.Name}To{destType.Name}");
    //                    var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(assemblyName, AssemblyBuilderAccess.Run);
    //                    var moduleBuilder = assemblyBuilder.DefineDynamicModule("MappingModule");
    //                    var typeBuilder = moduleBuilder.DefineType($"Mapper_{sourceType.Name}To{destType.Name}",
    //                        TypeAttributes.Public | TypeAttributes.Class);

    //                    var methodBuilder = typeBuilder.DefineMethod("Map",
    //                        MethodAttributes.Public | MethodAttributes.Static,
    //                        typeof(void),
    //                        new[] { typeof(object), typeof(object) });

    //                    var il = methodBuilder.GetILGenerator();

    //                    var sourceLocal = il.DeclareLocal(sourceType);
    //                    var destLocal = il.DeclareLocal(destType);

    //                    il.Emit(OpCodes.Ldarg_0);
    //                    il.Emit(OpCodes.Castclass, sourceType);
    //                    il.Emit(OpCodes.Stloc, sourceLocal);

    //                    il.Emit(OpCodes.Ldarg_1);
    //                    il.Emit(OpCodes.Castclass, destType);
    //                    il.Emit(OpCodes.Stloc, destLocal);

    //                    var sourceProps = sourceType.GetProperties();
    //                    var destProps = destType.GetProperties();

    //                    foreach (var sourceProp in sourceProps)
    //                    {
    //                        var destProp = destProps.FirstOrDefault(p =>
    //                            p.Name == sourceProp.Name && (p.PropertyType == sourceProp.PropertyType ||
    //                            Nullable.GetUnderlyingType(p.PropertyType) == Nullable.GetUnderlyingType(sourceProp.PropertyType)));

    //                        if (destProp != null && destProp.CanWrite)
    //                        {
    //                            il.Emit(OpCodes.Ldloc, destLocal);    
    //                            il.Emit(OpCodes.Ldloc, sourceLocal);
    //                            il.EmitCall(OpCodes.Callvirt, sourceProp.GetGetMethod(), null); 

    //                            il.EmitCall(OpCodes.Callvirt, destProp.GetSetMethod(), null);
    //                        }
    //                    }

    //                    il.Emit(OpCodes.Ret);

    //                    var dynamicType = typeBuilder.CreateType();
    //                    var mapMethod = dynamicType.GetMethod("Map");

    //                    _mapper = (Action<object, object>)Delegate.CreateDelegate(
    //                        typeof(Action<object, object>), mapMethod);
    //                    _emittedMappers[key] = _mapper;
    //                }
    //            }
    //        }

    //        _mapper(source, destination);
    //        return destination;
    //    }
    //}

    #region v1
    public class Mapper : IMapper
    {

        public TDestination Map<TSource, TDestination>(TSource source)
        {
            var destination = Activator.CreateInstance<TDestination>();
            MapObject(source, destination);
            return destination;
        }


        public TDestination Map<TSource, TDestination>(TSource source, TDestination destination)
        {
            MapObject(source, destination);
            return destination;
        }


        public IEnumerable<TDestination> MapList<TSource, TDestination>(IEnumerable<TSource> sourceList)
        {
            List<TDestination> destinationList = new List<TDestination>();

            foreach (var source in sourceList)
            {
                TDestination destination = Map<TSource, TDestination>(source);
                destinationList.Add(destination);
            }

            return destinationList;
        }

        private void MapObject<TSource, TDestination>(TSource source, TDestination destination)
        {
            var sourceProperties = typeof(TSource).GetProperties();
            var destinationProperties = typeof(TDestination).GetProperties();

            foreach (var sourceProperty in sourceProperties)
            {
                var destinationProperty = destinationProperties.FirstOrDefault(p =>
                    p.Name == sourceProperty.Name && (p.PropertyType == sourceProperty.PropertyType ||
                    Nullable.GetUnderlyingType(p.PropertyType) == sourceProperty.PropertyType));

                if (destinationProperty != null)
                {
                    var value = sourceProperty.GetValue(source);
                    destinationProperty.SetValue(destination, value);
                }
            }
        }


    }
    #endregion
}
