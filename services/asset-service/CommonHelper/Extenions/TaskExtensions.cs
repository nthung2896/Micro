using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper.Extenions
{
    public static class TaskExtensions
    {


        public static TaskAwaiter<(T1, T2)> GetAwaiter<T1, T2>(this (Task<T1>, Task<T2>) tasks)
        {
            return Task.WhenAll(tasks.Item1, tasks.Item2).ContinueWith(_ => (tasks.Item1.Result, tasks.Item2.Result)).GetAwaiter();
        }

        public static TaskAwaiter<(T1, T2, T3)> GetAwaiter<T1, T2, T3>(this (Task<T1>, Task<T2>, Task<T3>) tasks)
        {
            return Task.WhenAll(tasks.Item1, tasks.Item2, tasks.Item3).ContinueWith(_ => (tasks.Item1.Result, tasks.Item2.Result, tasks.Item3.Result)).GetAwaiter();
        }

        public static TaskAwaiter<(T1, T2, T3, T4)> GetAwaiter<T1, T2, T3, T4>(this (Task<T1>, Task<T2>, Task<T3>, Task<T4>) tasks)
        {
            return Task.WhenAll(tasks.Item1, tasks.Item2, tasks.Item3, tasks.Item4).ContinueWith(_ => (tasks.Item1.Result, tasks.Item2.Result, tasks.Item3.Result, tasks.Item4.Result)).GetAwaiter();
        }


        public static TaskAwaiter GetAwaiter(this (Func<Task>, Func<Task>) tasks)
                 => Task.WhenAll(tasks.Item1(), tasks.Item2()).GetAwaiter();
        //public static TaskAwaiter GetAwaiter(this (Func<Task> task1, Func<Task> task2) tasks)
        //{
        //    async Task ExecuteAll()
        //    {
        //        await Task.WhenAll(tasks.task1(), tasks.task2());
        //    }

        //    return ExecuteAll().GetAwaiter();
        //}

        public static TaskAwaiter GetAwaiter(this (Func<Task> task1, Func<Task> task2, Func<Task> task3) tasks)
        {
            async Task ExecuteAll()
            {
                await Task.WhenAll(tasks.task1(), tasks.task2(), tasks.task3());
            }

            return ExecuteAll().GetAwaiter();
        }

        public static TaskAwaiter GetAwaiter(this (Func<Task> task1, Func<Task> task2, Func<Task> task3, Func<Task> task4) tasks)
        {
            async Task ExecuteAll()
            {
                await Task.WhenAll(tasks.task1(), tasks.task2(), tasks.task3(), tasks.task4());
            }

            return ExecuteAll().GetAwaiter();
        }
    }

}
