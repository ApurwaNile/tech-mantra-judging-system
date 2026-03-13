-- Seed scoring criteria for all configured events.
-- Run AFTER creating the scoring_criteria table and after inserting events.

-- Helper: insert a criterion for all events with a given name, if it does not already exist.
-- Uses (event_id, name) uniqueness check to avoid duplicates on re-run.

-- Bridge Making
insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Design Accuracy & Dimensions', 10, 1
from public.events e
where e.name = 'Bridge Making'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Design Accuracy & Dimensions'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Knowledge of Bridge Structure', 10, 2
from public.events e
where e.name = 'Bridge Making'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Knowledge of Bridge Structure'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Innovation & Originality', 10, 3
from public.events e
where e.name = 'Bridge Making'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Innovation & Originality'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Strength / Load Capacity', 10, 4
from public.events e
where e.name = 'Bridge Making'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Strength / Load Capacity'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Material Efficiency', 10, 5
from public.events e
where e.name = 'Bridge Making'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Material Efficiency'
  );

-- CAD War
insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Following Dimensions & Specifications', 10, 1
from public.events e
where e.name = 'CAD War'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Following Dimensions & Specifications'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Drawing Accuracy', 15, 2
from public.events e
where e.name = 'CAD War'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Drawing Accuracy'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Completion within Time Limit', 15, 3
from public.events e
where e.name = 'CAD War'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Completion within Time Limit'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Presentation / Neatness', 10, 4
from public.events e
where e.name = 'CAD War'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Presentation / Neatness'
  );

-- Technical Paper Track A & B
-- We assume events are named exactly 'Technical Paper Track A' and 'Technical Paper Track B'.
do $$
declare
  ev record;
  crit_names text[] := array['Content','Organization','Delivery','Communication','Q&A'];
  crit_max   int[]  := array[20,20,20,20,20];
  i          int;
begin
  for ev in
    select id, name from public.events
    where name in ('Technical Paper Track A', 'Technical Paper Track B')
  loop
    for i in 1..array_length(crit_names, 1) loop
      insert into public.scoring_criteria (event_id, name, max_score, sort_order)
      select ev.id, crit_names[i], crit_max[i], i
      where not exists (
        select 1 from public.scoring_criteria c
        where c.event_id = ev.id and c.name = crit_names[i]
      );
    end loop;
  end loop;
end $$;

-- TechSprint Web Dev
insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Completion', 10, 1
from public.events e
where e.name = 'TechSprint Web Dev'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Completion'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Presentation & Pitch', 10, 2
from public.events e
where e.name = 'TechSprint Web Dev'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Presentation & Pitch'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'User Experience & Design', 10, 3
from public.events e
where e.name = 'TechSprint Web Dev'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'User Experience & Design'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Additional Features', 10, 4
from public.events e
where e.name = 'TechSprint Web Dev'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Additional Features'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Accuracy', 10, 5
from public.events e
where e.name = 'TechSprint Web Dev'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Accuracy'
  );

-- Project Competition ME
insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Problem Identification & Objectives', 10, 1
from public.events e
where e.name = 'Project Competition ME'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Problem Identification & Objectives'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Theory Knowledge', 10, 2
from public.events e
where e.name = 'Project Competition ME'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Theory Knowledge'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Innovativeness & Originality', 10, 3
from public.events e
where e.name = 'Project Competition ME'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Innovativeness & Originality'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Functionality & Performance', 10, 4
from public.events e
where e.name = 'Project Competition ME'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Functionality & Performance'
  );

insert into public.scoring_criteria (event_id, name, max_score, sort_order)
select e.id, 'Social/Environmental Impact', 10, 5
from public.events e
where e.name = 'Project Competition ME'
  and not exists (
    select 1 from public.scoring_criteria c
    where c.event_id = e.id and c.name = 'Social/Environmental Impact'
  );

