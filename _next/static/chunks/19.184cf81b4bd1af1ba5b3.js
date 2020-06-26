(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{B22H:function(e){e.exports=JSON.parse('{"filename":"2020/sqlite-performance-tuning.md","frontmatter":{"references":[],"date":"2020-06-26","subtitle":"Scaling SQLite databases to many concurrent readers and multiple gigabytes while maintaining 100k SELECTs per second","csl":"../ieee-with-url.csl","hidden":false,"url2cite-link-output":"sup","title":"SQLite performance tuning"},"preview":"SQLite is an embedded SQL database. It\u2019s extremely easy to setup, buildable as a single C file with libraries existing for basically all common programming languages. It doesn\u2019t need any server setup or configuration since the SQL logic is run in the host process, and the database consists of only","content_ast":[{"t":"Para","c":[{"t":"Str","c":"SQLite is an embedded SQL database. It\u2019s extremely easy to setup, buildable as a single C file with libraries existing for basically all common programming languages. It doesn\u2019t need any server setup or configuration since the SQL logic is run in the host process, and the database consists of only two files you can easily copy or move around. You can still connect to and query the same database concurrently with multiple processes, though only one write operation can happen at the same time."}]},{"t":"Para","c":[{"t":"Str","c":"SQLite is often seen as a toy database only suitable for databases with a few hundred entries and without any performance requirements, but you can scale a SQLite database to multiple GByte in size and many concurrent readers while maintaining high performance by applying the below optimizations."}]},{"t":"Header","c":[2,["run-these-every-time-you-connect-to-the-db",[],[]],[{"t":"Str","c":"Run these every time you connect to the db"}]]},{"t":"Para","c":[{"t":"Str","c":"Some of these are applied permanently, but others are reset on new connection, so it\u2019s recommended to run all of these each time you connect to the database."}]},{"t":"BulletList","c":[[{"t":"Para","c":[{"t":"Str","c":"Journal Mode"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma journal_mode = WAL;"]},{"t":"Para","c":[{"t":"Str","c":"Instead of writing changes directly to the db file, write to a write-ahead-log instead and regularily commit the changes. This allows multiple concurrent readers, and can significantly improve performance."}]}],[{"t":"Para","c":[{"t":"Str","c":"Synchronous Commit"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma synchronous = normal;"]},{"t":"Para","c":[{"t":"Str","c":"or even "},{"t":"Code","c":[["",[],[]],"synchronous=off"]},{"t":"Str","c":". The default is "},{"t":"Code","c":[["",[],[]],"full"]},{"t":"Str","c":", which means every single update has to wait for FSYNC. Normal is still completely corruption safe in WAL mode, and means only WAL checkpoints have to wait for FSYNC. Off can cause db corruption, though I\u2019ve never had problems. See here: "},{"t":"Link","c":[["",["uri"],[]],[{"t":"Str","c":"https://www.sqlite.org/pragma.html#pragma_synchronous"}],["https://www.sqlite.org/pragma.html#pragma_synchronous",""]]}]}],[{"t":"Para","c":[{"t":"Str","c":"Temporary files location"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma temp_store = memory;"]},{"t":"Para","c":[{"t":"Str","c":"Stores temporary indices / tables in memory. sqlite automatically "},{"t":"Link","c":[["",[],[]],[{"t":"Str","c":"creates temporary indices"}],["https://www.sqlite.org/tempfiles.html#transient_indices",""]]},{"t":"Str","c":" for some queries. Not sure how much this one helps."}]}],[{"t":"Para","c":[{"t":"Str","c":"Enable memory mapping"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma mmap_size = 30000000000;"]},{"t":"Para","c":[{"t":"Str","c":"Uses memory mapping instead of read/write calls when db is < mmap_size. Less syscalls, and pages and caches will be managed by the OS, so the performance of this depends on your operating system. Note that it will not use this amount of physical memory, just virtual memory. Should be much faster on at least Linux."}]}],[{"t":"Para","c":[{"t":"Str","c":"Increase the page size"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma page_size = 32768;"]},{"t":"Para","c":[{"t":"Str","c":"This improved performance and db size a lot for me in one project, but it\u2019s probably only useful if you are storing somewhat large blobs in your database and might not be good for other projects where rows are small."}]}]]},{"t":"Header","c":[3,["summary",[],[]],[{"t":"Str","c":"Summary"}]]},{"t":"Para","c":[{"t":"Str","c":"If you\u2019re too lazy to read all the above, just run this on every database connect:"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma journal_mode = WAL;\\npragma synchronous = normal;\\npragma temp_store = memory;\\npragma mmap_size = 30000000000;"]},{"t":"Header","c":[2,["more-things-that-must-be-run-manually",[],[]],[{"t":"Str","c":"More things that must be run manually"}]]},{"t":"BulletList","c":[[{"t":"Para","c":[{"t":"Str","c":"Reorganize the database"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma vacuum;"]},{"t":"Para","c":[{"t":"Str","c":"Run once to completely rewrite the db. Very expensive if your database is 100MB+."}]}],[{"t":"Para","c":[{"t":"Str","c":"Re-analyze the database"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma optimize;"]},{"t":"BlockQuote","c":[{"t":"Para","c":[{"t":"Str","c":"To achieve the best long-term query performance without the need to do a detailed engineering analysis of the application schema and SQL, it is recommended that applications run "},{"t":"Quoted","c":[{"t":"DoubleQuote"},[{"t":"Str","c":"PRAGMA optimize"}]]},{"t":"Str","c":" (with no arguments) just before closing each database connection. Long-running applications might also benefit from setting a timer to run "},{"t":"Quoted","c":[{"t":"DoubleQuote"},[{"t":"Str","c":"PRAGMA optimize"}]]},{"t":"Str","c":" every few hours. "},{"t":"Span","c":[["",["source"],[]],[{"t":"Link","c":[["",["uri"],[]],[{"t":"Str","c":"https://www.sqlite.org/pragma.html#pragma_optimize"}],["https://www.sqlite.org/pragma.html#pragma_optimize",""]]}]]}]}]}],[{"t":"Para","c":[{"t":"Str","c":"Vacuum the database"}]},{"t":"CodeBlock","c":[["",["sql"],[]],"pragma auto_vacuum = incremental; -- once on first DB create\\npragma incremental_vacuum; -- regularily"]},{"t":"Para","c":[{"t":"Str","c":"Probably not useful unless you expect your DB to shrink significantly regularily."}]},{"t":"BlockQuote","c":[{"t":"Para","c":[{"t":"Str","c":"The freelist pages are moved to the end of the database file and the database file is truncated to remove the freelist pages [\u2026]. Note, however, that auto-vacuum only truncates the freelist pages from the file. Auto-vacuum does not defragment the database nor repack individual database pages the way that the VACUUM command does. In fact, because it moves pages around within the file, auto-vacuum can actually make fragmentation worse. "},{"t":"Span","c":[["",["source"],[]],[{"t":"Link","c":[["",["uri"],[]],[{"t":"Str","c":"https://www.sqlite.org/pragma.html#pragma_incremental_vacuum"}],["https://www.sqlite.org/pragma.html#pragma_incremental_vacuum",""]]}]]}]}]}]]},{"t":"Header","c":[2,["regarding-wal-mode",[],[]],[{"t":"Str","c":"Regarding WAL mode"}]]},{"t":"Para","c":[{"t":"Str","c":"WAL mode has some issues where depending on the write pattern, the WAL size can grow to infinity, slowing down performance a lot. I think this usually happens when you have lots of writes that lock the table so sqlite never gets to "},{"t":"Link","c":[["",[],[]],[{"t":"Str","c":"doing wal_autocheckpoint"}],["https://www.sqlite.org/wal.html#ckpt",""]]},{"t":"Str","c":". There\u2019s a few ways to mitigate this:"}]},{"t":"OrderedList","c":[[1,{"t":"Decimal"},{"t":"Period"}],[[{"t":"Plain","c":[{"t":"Str","c":"Reduce "},{"t":"Link","c":[["",[],[]],[{"t":"Str","c":"wal_autocheckpoint interval"}],["https://www.sqlite.org/pragma.html#pragma_wal_autocheckpoint",""]]},{"t":"Str","c":". No guarantees since all autocheckpoints are passive."}]}],[{"t":"Plain","c":[{"t":"Str","c":"Run "},{"t":"Code","c":[["",[],[]],"pragma wal_checkpoint(full)"]},{"t":"Str","c":" or "},{"t":"Code","c":[["",[],[]],"pragma wal_checkpoint(truncate)"]},{"t":"Str","c":" sometimes. With "},{"t":"Code","c":[["",[],[]],"full"]},{"t":"Str","c":", the WAL file won\u2019t change size if other processes have the file open but still commit everything so new data will not cause the WAL file to grow. If you run "},{"t":"Code","c":[["",[],[]],"truncate"]},{"t":"Str","c":" it will block other processes and reset the WAL file to zero bytes. Note that you "},{"t":"Emph","c":[{"t":"Str","c":"can"}]},{"t":"Str","c":" run these from a separate process."}]}]]]}]}')}}]);