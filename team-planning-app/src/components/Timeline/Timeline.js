import React from 'react';
import Timeline, { TimelineMarkers, TodayMarker } from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css'; // Default styles
import './Timeline.css'; // Custom styles
import moment from 'moment';

// Helper function to find a project name by its ID
const getProjectName = (projectId, projects) => {
  const project = projects.find(p => p.id === projectId);
  return project ? project.name : 'Unknown Project';
};

function TimelineDisplay({ groups, items, setItems, projects }) {
  const defaultTimeStart = moment().startOf('day').subtract(2, 'days');
  const defaultTimeEnd = moment().startOf('day').add(5, 'days');

  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const group = groups[newGroupOrder];
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, start_time: dragTime, end_time: dragTime + (item.end_time - item.start_time), group: group.id }
        : item
    ));
  };

  const handleItemResize = (itemId, time, edge) => {
    const movedItem = items.find(i => i.id === itemId);
    if (!movedItem) return;

    const newStartTime = edge === 'left' ? time : movedItem.start_time;
    const newEndTime = edge === 'right' ? time : movedItem.end_time;

    if (newEndTime <= newStartTime) {
      console.warn("End time cannot be before or equal to start time.");
      return; // Prevent invalid resize
    }

    let updatedItems = items.map(item =>
      item.id === itemId
        ? { ...item, start_time: newStartTime, end_time: newEndTime }
        : item
    );

    // Shift subsequent items if the end_time was changed and it's the 'right' edge
    if (edge === 'right') {
      const timeShift = newEndTime - movedItem.end_time; // How much the item was extended or shortened

      updatedItems = updatedItems.map(item => {
        // If it's a subsequent item in the same group and not the item being resized
        if (item.group === movedItem.group && item.id !== itemId && item.start_time >= movedItem.end_time) {
          return {
            ...item,
            start_time: item.start_time + timeShift,
            end_time: item.end_time + timeShift,
          };
        }
        return item;
      });
    }
    // Note: Shifting for 'left' edge resize impacting subsequent items is more complex if overlaps are strictly forbidden
    // and might require pushing items to the right or left.
    // For now, we only shift subsequent items on right edge resize.

    setItems(updatedItems);
  };

  // Custom item renderer to display project name
  const itemRenderer = ({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    const backgroundColor = itemContext.selected ? (itemContext.dragging ? 'red' : item.selectedBgColor) : item.bgColor;
    const borderColor = itemContext.resizing ? 'red' : item.color;
    return (
      <div
        {...getItemProps({
          style: {
            backgroundColor,
            color: item.color,
            borderColor,
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 4,
            borderLeftWidth: itemContext.selected ? 3 : 1,
            borderRightWidth: itemContext.selected ? 3 : 1,
            fontSize: '12px',
            overflow: 'hidden',
            paddingLeft: '3px',
          },
        })}
      >
        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}
        <div
          className="rct-item-content"
          style={{ maxHeight: `${itemContext.dimensions.height}` }}
        >
          {getProjectName(item.project, projects)} - {moment(item.start_time).format('HH:mm')} - {moment(item.end_time).format('HH:mm')}
        </div>
        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
      </div>
    );
  };


  // For now, new assignments will need to be added via initialData.json or by modifying App.js state directly
  // A UI for adding assignments will be a separate step if needed.

  return (
    <div className="timeline-container">
      <h2>Project Assignments</h2>
      <Timeline
        groups={groups}
        items={items.map(item => ({ // Ensure items have a project field for the renderer
          ...item,
          // Ensure start_time and end_time are moment objects or compatible timestamps
                          // title is now derived from project name in itemRenderer
        }))}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        canMove
        canResize="right" // Or "both" or "left"
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        itemRenderer={itemRenderer} // Custom renderer
        // Add other props as needed:
        // onItemSelect, onItemDeselect, onItemDoubleClick, etc.
        // stackItems
        // itemHeightRatio={0.75}
        sidebarWidth={150}
        lineHeight={40}
      >
        <TimelineMarkers>
          <TodayMarker />
        </TimelineMarkers>
      </Timeline>
    </div>
  );
}

export default TimelineDisplay;
