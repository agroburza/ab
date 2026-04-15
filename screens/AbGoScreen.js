import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  AB_GO_COMMON_CATEGORY,
  getAbGoProfileBranches,
  getAbGoGroups,
  getAbGoCrops,
  getAbGoActions,
  getAbGoSmartReminder,
} from '../utils/AbGoUtils';

const COMMON_BRANCH_KEY = AB_GO_COMMON_CATEGORY.key;

const STORAGE_KEY = 'abgo_tasks_v2';

const DATE_PRESETS = [];

const TIME_PRESETS = [];

const LIST_FILTERS = [
  { key: 'day', label: 'Dan' },
  { key: 'upcoming', label: 'Uskoro' },
  { key: 'done', label: 'Riješeno' },
  { key: 'all', label: 'Sve' },
];

const HISTORY_STATUS_OPTIONS = [
  { key: 'all', label: 'Sve' },
  { key: 'done', label: 'Riješeno' },
  { key: 'open', label: 'Otvoreno' },
];

const HISTORY_PERIOD_OPTIONS = [
  { key: 'week', label: 'Tjedan' },
  { key: 'month', label: 'Mjesec' },
  { key: 'year', label: 'Godina' },
  { key: 'all', label: 'Sve' },
];

const REPORT_PERIOD_OPTIONS = HISTORY_PERIOD_OPTIONS.filter((item) => item.key !== 'all');

const REPEAT_OPTIONS = [
  { key: 'none', label: 'Bez ponavljanja' },
  { key: 'daily', label: 'Svaki dan' },
  { key: 'weekly', label: 'Svaki tjedan' },
  { key: 'monthly', label: 'Svaki mjesec' },
  { key: 'custom_days', label: 'Odaberi broj dana' },
];

const HR_WEEKDAY_LONG = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
const HR_MONTHS = [
  'Siječanj',
  'Veljača',
  'Ožujak',
  'Travanj',
  'Svibanj',
  'Lipanj',
  'Srpanj',
  'Kolovoz',
  'Rujan',
  'Listopad',
  'Studeni',
  'Prosinac',
];

function formatDateOffset(offsetDays = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return toIsoDate(date);
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatCroatianDate(dateStr) {
  const date = toLocalDate(dateStr);
  if (!date) return '';
  const d = `${date.getDate()}`.padStart(2, '0');
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}.`;
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const [h = '00', m = '00'] = String(timeStr).split(':');
  return `${Number(h)}:${String(m).padStart(2, '0')}`;
}

function timeStringToDate(timeStr) {
  const now = new Date();
  const [h, m] = String(timeStr || '07:00').split(':').map(Number);
  now.setHours(Number.isFinite(h) ? h : 7, Number.isFinite(m) ? m : 0, 0, 0);
  return now;
}

function formatCalendarDayLabel(dateStr) {
  const date = toLocalDate(dateStr);
  if (!date) return { weekday: '', date: '' };
  return {
    weekday: HR_WEEKDAY_LONG[date.getDay()],
    date: `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.`,
  };
}

function humanDateLabel(dateStr) {
  if (!dateStr) return 'Bez datuma';
  const today = formatDateOffset(0);
  const tomorrow = formatDateOffset(1);
  const dayAfter = formatDateOffset(2);
  if (dateStr === today) return 'Danas';
  if (dateStr === tomorrow) return 'Sutra';
  if (dateStr === dayAfter) return 'Prekosutra';
  return formatCroatianDate(dateStr);
}

function addDays(dateStr, days) {
  const date = toLocalDate(dateStr) || new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function addMonths(dateStr, months) {
  const date = toLocalDate(dateStr) || new Date();
  date.setMonth(date.getMonth() + months);
  return toIsoDate(date);
}

function getNextRepeatDate(dateStr, repeatRule, repeatDays = 7) {
  if (!dateStr || repeatRule === 'none') return '';
  if (repeatRule === 'daily') return addDays(dateStr, 1);
  if (repeatRule === 'weekly') return addDays(dateStr, 7);
  if (repeatRule === 'monthly') return addMonths(dateStr, 1);
  if (repeatRule === 'custom_days') return addDays(dateStr, Math.max(1, Number(repeatDays) || 1));
  return '';
}

function getRepeatLabel(rule) {
  return REPEAT_OPTIONS.find((item) => item.key === rule)?.label || '';
}

function getStatusByDate(dateStr) {
  const taskDate = toLocalDate(dateStr);
  const today = toLocalDate(formatDateOffset(0));
  if (!taskDate || !today) return 'normal';
  const diffDays = Math.round((taskDate - today) / 86400000);
  if (diffDays <= 0) return 'urgent';
  if (diffDays <= 2) return 'soon';
  return 'normal';
}

function getStatusMeta(status, done = false) {
  if (done) return { label: 'Riješeno', bg: '#E0E7FF', fg: '#3730A3' };
  if (status === 'urgent') return { label: 'Hitno', bg: '#FEE2E2', fg: '#B91C1C' };
  if (status === 'soon') return { label: 'Uskoro', bg: '#FEF3C7', fg: '#92400E' };
  return { label: 'Planirano', bg: '#DCFCE7', fg: '#166534' };
}

function isWithinNext7Days(dateStr) {
  const taskDate = toLocalDate(dateStr);
  const today = toLocalDate(formatDateOffset(0));
  const weekEnd = toLocalDate(formatDateOffset(7));
  if (!taskDate || !today || !weekEnd) return false;
  return taskDate >= today && taskDate <= weekEnd;
}

function groupTasksByDate(items = []) {
  return items.reduce((acc, task) => {
    const key = task.date || 'bez-datuma';
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});
}

function sortTasksAsc(a, b) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

function sortTasksDesc(a, b) {
  return `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
}

function getTaskDateTime(task = {}) {
  const date = toLocalDate(task.date);
  if (!date) return null;

  const [hours = '0', minutes = '0'] = String(task.time || '00:00').split(':');
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return date;
}

function isRepeatingTask(task = {}) {
  return !!task.repeatRule && task.repeatRule !== 'none';
}

function isArchivedTask(task = {}, now = new Date()) {
  const taskDateTime = getTaskDateTime(task);
  if (!taskDateTime) return false;
  return !isRepeatingTask(task) && taskDateTime < now;
}

function getWeekStart(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const dayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayOffset);
  return start;
}

function getWeekEnd(date) {
  const end = getWeekStart(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getMonthStart(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getMonthEnd(date) {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getYearStart(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getYearEnd(date) {
  const end = new Date(date.getFullYear(), 11, 31);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getArchivePeriodRange(period, anchorDateStr) {
  if (period === 'all') return null;

  const anchor = toLocalDate(anchorDateStr) || new Date();
  if (period === 'week') return { start: getWeekStart(anchor), end: getWeekEnd(anchor) };
  if (period === 'year') return { start: getYearStart(anchor), end: getYearEnd(anchor) };
  return { start: getMonthStart(anchor), end: getMonthEnd(anchor) };
}

function isTaskInArchivePeriod(task, period, anchorDateStr) {
  const range = getArchivePeriodRange(period, anchorDateStr);
  if (!range) return true;

  const taskDateTime = getTaskDateTime(task);
  if (!taskDateTime) return false;
  return taskDateTime >= range.start && taskDateTime <= range.end;
}

function formatArchivePeriodLabel(period, anchorDateStr) {
  if (period === 'all') return 'Sva arhiva';

  const anchor = toLocalDate(anchorDateStr) || new Date();
  if (period === 'week') {
    const start = getWeekStart(anchor);
    const end = getWeekEnd(anchor);
    return `${formatCroatianDate(toIsoDate(start))} - ${formatCroatianDate(toIsoDate(end))}`;
  }

  if (period === 'year') return `${anchor.getFullYear()}`;

  return `${HR_MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
}

function shiftArchivePeriod(anchorDateStr, period, direction) {
  const anchor = toLocalDate(anchorDateStr) || new Date();
  if (period === 'week') anchor.setDate(anchor.getDate() + direction * 7);
  if (period === 'month') anchor.setMonth(anchor.getMonth() + direction);
  if (period === 'year') anchor.setFullYear(anchor.getFullYear() + direction);
  return toIsoDate(anchor);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function AbGoScreen({ profileData, monitoringData }) {
  const branches = useMemo(
    () => getAbGoProfileBranches(profileData?.djelatnosti || []),
    [profileData?.djelatnosti]
  );

  const defaultBranch = useMemo(() => {
    return branches.find((item) => item.key !== AB_GO_COMMON_CATEGORY.key)?.key || branches[0]?.key || AB_GO_COMMON_CATEGORY.key;
  }, [branches]);

  const [tasks, setTasks] = useState([]);
  const [currentTab, setCurrentTab] = useState('active');
  const [listFilter, setListFilter] = useState('day');
  const [selectedDate, setSelectedDate] = useState(formatDateOffset(0));
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState('');

  const [historyBranch, setHistoryBranch] = useState('all');
  const [historyGroup, setHistoryGroup] = useState('all');
  const [historyCrop, setHistoryCrop] = useState('all');
  const [historyAction, setHistoryAction] = useState('all');
  const [historyStatus, setHistoryStatus] = useState('all');
  const [historyPeriod, setHistoryPeriod] = useState('month');
  const [historyPeriodAnchor, setHistoryPeriodAnchor] = useState(formatDateOffset(0));
  const [archiveReportModalVisible, setArchiveReportModalVisible] = useState(false);

  const [draftDate, setDraftDate] = useState(formatDateOffset(0));
  const [draftTime, setDraftTime] = useState('07:00');
  const [draftBranch, setDraftBranch] = useState(defaultBranch);
  const [draftGroup, setDraftGroup] = useState('');
  const [draftCrop, setDraftCrop] = useState('');
  const [draftAction, setDraftAction] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [draftRepeat, setDraftRepeat] = useState('none');
  const [draftRepeatDays, setDraftRepeatDays] = useState('7');
  const [draftIsUrgent, setDraftIsUrgent] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [kpiModalVisible, setKpiModalVisible] = useState(false);
  const [kpiModalKey, setKpiModalKey] = useState('today');
  const [archivePdfLoading, setArchivePdfLoading] = useState(false);

  const [branchMenuVisible, setBranchMenuVisible] = useState(false);
  const [draftBranchMenuVisible, setDraftBranchMenuVisible] = useState(false);
  const [draftGroupMenuVisible, setDraftGroupMenuVisible] = useState(false);
  const [draftCropMenuVisible, setDraftCropMenuVisible] = useState(false);
  const [draftActionMenuVisible, setDraftActionMenuVisible] = useState(false);
  const [draftRepeatMenuVisible, setDraftRepeatMenuVisible] = useState(false);

  const [historyBranchMenuVisible, setHistoryBranchMenuVisible] = useState(false);
  const [historyGroupMenuVisible, setHistoryGroupMenuVisible] = useState(false);
  const [historyCropMenuVisible, setHistoryCropMenuVisible] = useState(false);
  const [historyActionMenuVisible, setHistoryActionMenuVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTasks(parsed);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch(() => {});
  }, [tasks]);

  const selectedBranchMeta = useMemo(
    () => branches.find((item) => item.key === selectedBranch) || AB_GO_COMMON_CATEGORY,
    [branches, selectedBranch]
  );

  const draftBranchMeta = useMemo(
    () => branches.find((item) => item.key === draftBranch) || AB_GO_COMMON_CATEGORY,
    [branches, draftBranch]
  );

  const isCommonBranch = draftBranch === COMMON_BRANCH_KEY;
  const groups = useMemo(() => getAbGoGroups(draftBranch), [draftBranch]);
  const crops = useMemo(() => getAbGoCrops(draftBranch, draftGroup), [draftBranch, draftGroup]);
  const actions = useMemo(() => {
    if (draftBranch === COMMON_BRANCH_KEY) {
      const directCrop = getAbGoCrops(draftBranch, draftGroup)[0];
      return directCrop?.actions || [];
    }
    return getAbGoActions(draftBranch, draftGroup, draftCrop);
  }, [draftBranch, draftGroup, draftCrop]);

  const draftGroupMeta = useMemo(() => groups.find((item) => item.key === draftGroup), [groups, draftGroup]);
  const draftCropMeta = useMemo(() => {
    if (draftBranch === COMMON_BRANCH_KEY) return null;
    return crops.find((item) => item.key === draftCrop);
  }, [draftBranch, crops, draftCrop]);
  const draftActionMeta = useMemo(
    () => actions.find((item) => item.key === draftAction),
    [actions, draftAction]
  );

  const historyBranchOptions = useMemo(
    () => [{ key: 'all', label: 'Sve djelatnosti', emoji: '🗂️' }, ...branches],
    [branches]
  );

  const historyGroups = useMemo(() => {
    if (historyBranch === 'all') {
      const all = [];
      branches.forEach((branch) => {
        getAbGoGroups(branch.key).forEach((item) => {
          all.push({ ...item, branchKey: branch.key, branchLabel: branch.label });
        });
      });
      return all;
    }
    return getAbGoGroups(historyBranch);
  }, [branches, historyBranch]);

  const historyCrops = useMemo(() => {
    if (historyBranch === COMMON_BRANCH_KEY) return [];
    if (historyBranch === 'all' || historyGroup === 'all') {
      if (historyBranch === 'all') {
        const all = [];
        branches.forEach((branch) => {
          if (branch.key === COMMON_BRANCH_KEY) return;
          getAbGoGroups(branch.key).forEach((group) => {
            getAbGoCrops(branch.key, group.key).forEach((crop) => {
              all.push({ ...crop, branchKey: branch.key, groupKey: group.key });
            });
          });
        });
        return all;
      }
      const all = [];
      getAbGoGroups(historyBranch).forEach((group) => {
        getAbGoCrops(historyBranch, group.key).forEach((crop) => {
          all.push({ ...crop, groupKey: group.key });
        });
      });
      return all;
    }
    return getAbGoCrops(historyBranch, historyGroup);
  }, [branches, historyBranch, historyGroup]);

  const historyActions = useMemo(() => {
    if (historyBranch === 'all') {
      const map = new Map();
      branches.forEach((branch) => {
        getAbGoGroups(branch.key).forEach((group) => {
          const directCrops = getAbGoCrops(branch.key, group.key);
          if (branch.key === COMMON_BRANCH_KEY) {
            (directCrops[0]?.actions || []).forEach((action) => {
              if (!map.has(action.key)) map.set(action.key, action);
            });
            return;
          }
          directCrops.forEach((crop) => {
            getAbGoActions(branch.key, group.key, crop.key).forEach((action) => {
              if (!map.has(action.key)) map.set(action.key, action);
            });
          });
        });
      });
      return Array.from(map.values());
    }

    if (historyBranch === COMMON_BRANCH_KEY) {
      if (historyGroup === 'all') {
        const map = new Map();
        getAbGoGroups(historyBranch).forEach((group) => {
          (getAbGoCrops(historyBranch, group.key)[0]?.actions || []).forEach((action) => {
            if (!map.has(action.key)) map.set(action.key, action);
          });
        });
        return Array.from(map.values());
      }
      return getAbGoCrops(historyBranch, historyGroup)[0]?.actions || [];
    }

    if (historyGroup === 'all') {
      const map = new Map();
      getAbGoGroups(historyBranch).forEach((group) => {
        getAbGoCrops(historyBranch, group.key).forEach((crop) => {
          getAbGoActions(historyBranch, group.key, crop.key).forEach((action) => {
            if (!map.has(action.key)) map.set(action.key, action);
          });
        });
      });
      return Array.from(map.values());
    }

    if (historyCrop === 'all') {
      const map = new Map();
      getAbGoCrops(historyBranch, historyGroup).forEach((crop) => {
        getAbGoActions(historyBranch, historyGroup, crop.key).forEach((action) => {
          if (!map.has(action.key)) map.set(action.key, action);
        });
      });
      return Array.from(map.values());
    }

    return getAbGoActions(historyBranch, historyGroup, historyCrop);
  }, [branches, historyBranch, historyGroup, historyCrop]);

  const historyBranchMeta = useMemo(
    () => historyBranchOptions.find((item) => item.key === historyBranch) || historyBranchOptions[0],
    [historyBranchOptions, historyBranch]
  );
  const historyGroupMeta = useMemo(
    () => (historyGroup === 'all'
      ? { key: 'all', label: 'Sve skupine', emoji: '📁' }
      : historyGroups.find((item) => item.key === historyGroup)) || { key: 'all', label: 'Sve skupine', emoji: '📁' },
    [historyGroups, historyGroup]
  );
  const historyCropMeta = useMemo(
    () => (historyCrop === 'all'
      ? { key: 'all', label: 'Sve kulture', emoji: '🌱' }
      : historyCrops.find((item) => item.key === historyCrop)) || { key: 'all', label: 'Sve kulture', emoji: '🌱' },
    [historyCrops, historyCrop]
  );
  const historyActionMeta = useMemo(
    () => (historyAction === 'all'
      ? { key: 'all', label: 'Sve radnje', emoji: '🛠️' }
      : historyActions.find((item) => item.key === historyAction)) || { key: 'all', label: 'Sve radnje', emoji: '🛠️' },
    [historyActions, historyAction]
  );
  const showHistoryGroupFilter = historyBranch !== 'all';
  const showHistoryCropFilter = showHistoryGroupFilter && historyBranch !== COMMON_BRANCH_KEY && historyGroup !== 'all';
  const showHistoryActionFilter = showHistoryGroupFilter && historyGroup !== 'all' && (historyBranch === COMMON_BRANCH_KEY || historyCrop !== 'all');
  const showDraftGroupFilter = !!draftBranch;
  const showDraftCropFilter = showDraftGroupFilter && draftBranch !== COMMON_BRANCH_KEY && !!draftGroup;
  const showDraftActionFilter = showDraftGroupFilter && !!draftGroup && (draftBranch === COMMON_BRANCH_KEY || !!draftCrop);
  const now = new Date();
  const activeTaskPool = useMemo(
    () => tasks.filter((task) => !isArchivedTask(task, now)),
    [tasks, now]
  );
  const archiveTaskPool = useMemo(
    () => tasks.filter((task) => isArchivedTask(task, now)),
    [tasks, now]
  );
  const periodArchiveTaskPool = useMemo(
    () => archiveTaskPool.filter((task) => isTaskInArchivePeriod(task, historyPeriod, historyPeriodAnchor)),
    [archiveTaskPool, historyPeriod, historyPeriodAnchor]
  );
  const archivePeriodLabel = useMemo(
    () => formatArchivePeriodLabel(historyPeriod, historyPeriodAnchor),
    [historyPeriod, historyPeriodAnchor]
  );
  const archiveReportTitle = useMemo(() => {
    if (historyPeriod === 'week') return 'Tjedni izvještaj';
    if (historyPeriod === 'month') return 'Mjesečni izvještaj';
    if (historyPeriod === 'year') return 'Godišnji izvještaj';
    return 'Izvještaj arhive';
  }, [historyPeriod]);

  const kpis = useMemo(() => {
    const openTasks = activeTaskPool.filter((task) => !task.done);
    return [
      {
        key: 'today',
        title: '⏳ Danas',
        value: String(openTasks.filter((task) => task.date === formatDateOffset(0)).length),
        note: 'Današnje obaveze',
        bg: '#F0FDF4',
      },
      {
        key: 'week',
        title: '📅 Tjedan',
        value: String(openTasks.filter((task) => isWithinNext7Days(task.date)).length),
        note: 'Sljedećih 7 dana',
        bg: '#EFF6FF',
      },
      {
        key: 'focus',
        title: '⚡ Fokus',
        value: String(openTasks.filter((task) => task.isUrgent).length),
        note: '🔥 \n Hitno',
        bg: '#FEF2F2',
      },
    ];
  }, [activeTaskPool]);

  const activeTasks = useMemo(() => {
    let filtered = activeTaskPool.filter((task) => task.branchKey === selectedBranch);

    if (listFilter === 'day') {
      filtered = filtered.filter((task) => task.date === selectedDate && !task.done);
    } else if (listFilter === 'upcoming') {
      filtered = filtered.filter((task) => isWithinNext7Days(task.date) && !task.done);
    } else if (listFilter === 'done') {
      filtered = filtered.filter((task) => task.done);
    }

    return [...filtered].sort(sortTasksAsc);
  }, [activeTaskPool, selectedBranch, listFilter, selectedDate]);

  const groupedActiveTasks = useMemo(() => groupTasksByDate(activeTasks), [activeTasks]);
  const groupedActiveDates = useMemo(() => Object.keys(groupedActiveTasks).sort(), [groupedActiveTasks]);

  const historyTasks = useMemo(() => {
    let filtered = [...periodArchiveTaskPool];

    if (historyBranch !== 'all') filtered = filtered.filter((task) => task.branchKey === historyBranch);
    if (historyGroup !== 'all') filtered = filtered.filter((task) => task.groupKey === historyGroup);
    if (historyCrop !== 'all') filtered = filtered.filter((task) => task.cropKey === historyCrop);
    if (historyAction !== 'all') filtered = filtered.filter((task) => task.actionKey === historyAction);

    if (historyStatus === 'done') {
      filtered = filtered.filter((task) => task.done);
    } else if (historyStatus === 'open') {
      filtered = filtered.filter((task) => !task.done);
    }

    return [...filtered].sort(sortTasksDesc);
  }, [periodArchiveTaskPool, historyBranch, historyGroup, historyCrop, historyAction, historyStatus]);

  const groupedHistoryTasks = useMemo(() => groupTasksByDate(historyTasks), [historyTasks]);
  const groupedHistoryDates = useMemo(() => Object.keys(groupedHistoryTasks).sort().reverse(), [groupedHistoryTasks]);

  const archiveStats = useMemo(() => {
    const total = periodArchiveTaskPool.length;
    const done = periodArchiveTaskPool.filter((t) => t.done).length;
    const open = total - done;

    const branchCount = {};
    const actionCount = {};

    periodArchiveTaskPool.forEach((t) => {
      if (t.branchLabel) branchCount[t.branchLabel] = (branchCount[t.branchLabel] || 0) + 1;
      if (t.actionLabel) actionCount[t.actionLabel] = (actionCount[t.actionLabel] || 0) + 1;
    });

    const topBranch = Object.entries(branchCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    const topAction = Object.entries(actionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return { total, done, open, topBranch, topAction };
  }, [periodArchiveTaskPool]);
  const archiveKpis = useMemo(() => [
    {
      key: 'archive-total',
      title: 'Ukupno',
      value: String(archiveStats.total),
      note: 'Svi zadaci',
      bg: '#F8FAFC',
    },
    {
      key: 'archive-done',
      title: 'Riješeno',
      value: String(archiveStats.done),
      note: 'Završeni',
      bg: '#EEF6FF',
    },
    {
      key: 'archive-open',
      title: 'Otvoreno',
      value: String(archiveStats.open),
      note: 'Aktivni',
      bg: '#FEF2F2',
    },
  ], [archiveStats]);
  const calendarDates = useMemo(() => Array.from({ length: 14 }, (_, index) => formatDateOffset(index)), []);
  const kpiModalTasks = useMemo(() => {
    const openTasks = activeTaskPool.filter((task) => !task.done);
    let filtered = openTasks;

    if (kpiModalKey === 'today') {
      filtered = openTasks.filter((task) => task.date === formatDateOffset(0));
    } else if (kpiModalKey === 'week') {
      filtered = openTasks.filter((task) => isWithinNext7Days(task.date));
    } else if (kpiModalKey === 'focus') {
      filtered = openTasks.filter((task) => task.isUrgent);
    } else if (kpiModalKey === 'archive-total') {
      filtered = periodArchiveTaskPool;
    } else if (kpiModalKey === 'archive-done') {
      filtered = periodArchiveTaskPool.filter((task) => task.done);
    } else if (kpiModalKey === 'archive-open') {
      filtered = periodArchiveTaskPool.filter((task) => !task.done);
    }

    const isArchiveKpi = kpiModalKey.startsWith('archive-');
    return [...filtered].sort(isArchiveKpi ? sortTasksDesc : sortTasksAsc);
  }, [activeTaskPool, periodArchiveTaskPool, kpiModalKey]);

  const kpiModalTitle = useMemo(() => {
    if (kpiModalKey === 'today') return '⏳ Danas';
    if (kpiModalKey === 'week') return '📅 Tjedan';
    if (kpiModalKey === 'archive-total') return 'Ukupno';
    if (kpiModalKey === 'archive-done') return 'Riješeno';
    if (kpiModalKey === 'archive-open') return 'Otvoreno';
    return '⚡ Fokus';
  }, [kpiModalKey]);

  const buildArchiveReportHtml = () => {
    const rows = historyTasks.map((task) => `
      <tr>
        <td>${escapeHtml(formatCroatianDate(task.date))}</td>
        <td>${escapeHtml(formatDisplayTime(task.time))}</td>
        <td>${escapeHtml(task.branchLabel)}</td>
        <td>${escapeHtml(task.groupLabel)}</td>
        <td>${escapeHtml(task.cropLabel || '-')}</td>
        <td>${escapeHtml(task.actionLabel || task.note || '-')}</td>
        <td>${escapeHtml(task.done ? 'Riješeno' : 'Otvoreno')}</td>
      </tr>
    `).join('');

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 28px; }
            .eyebrow { color: #7FA52A; font-size: 12px; font-weight: 700; text-transform: uppercase; }
            h1 { font-size: 28px; margin: 6px 0 4px; }
            .period { color: #475569; margin-bottom: 24px; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
            .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px; }
            .label { color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .value { font-size: 24px; font-weight: 800; margin-top: 6px; }
            .summary { background: #EEF6DF; border-radius: 14px; padding: 14px; margin-bottom: 20px; }
            .summary p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #7FA52A; color: #fff; text-align: left; padding: 8px; }
            td { border-bottom: 1px solid #E2E8F0; padding: 8px; vertical-align: top; }
          </style>
        </head>
        <body>
          <div class="eyebrow">ab GO</div>
          <h1>${escapeHtml(archiveReportTitle)}</h1>
          <div class="period">${escapeHtml(archivePeriodLabel)}</div>

          <div class="stats">
            <div class="card"><div class="label">Ukupno</div><div class="value">${archiveStats.total}</div></div>
            <div class="card"><div class="label">Riješeno</div><div class="value">${archiveStats.done}</div></div>
            <div class="card"><div class="label">Otvoreno</div><div class="value">${archiveStats.open}</div></div>
          </div>

          <div class="summary">
            <p><strong>Najčešća djelatnost:</strong> ${escapeHtml(archiveStats.topBranch)}</p>
            <p><strong>Najčešća radnja:</strong> ${escapeHtml(archiveStats.topAction)}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Vrijeme</th>
                <th>Djelatnost</th>
                <th>Skupina</th>
                <th>Kultura</th>
                <th>Radnja</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7">Nema zadataka za odabrani period.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const exportArchiveReportPdf = async () => {
    try {
      setArchivePdfLoading(true);
      const { uri } = await Print.printToFileAsync({
        html: buildArchiveReportHtml(),
        base64: false,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: archiveReportTitle,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF izrađen', `PDF je izrađen: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Greška', 'PDF izvještaj nije uspješno izrađen.');
    } finally {
      setArchivePdfLoading(false);
    }
  };


  const resetDraft = () => {
    setEditingTaskId('');
    setDraftDate(formatDateOffset(0));
    setDraftTime('07:00');
    setDraftBranch('');
    setDraftGroup('');
    setDraftCrop('');
    setDraftAction('');
    setDraftNote('');
    setDraftRepeat('none');
    setDraftRepeatDays('7');
    setDraftIsUrgent(false);
  };

  const openAddModal = () => {
    resetDraft();
    setModalVisible(true);
    setDraftBranchMenuVisible(false);
    setDraftGroupMenuVisible(false);
    setDraftCropMenuVisible(false);
    setDraftActionMenuVisible(false);
    setDraftRepeatMenuVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const openEditTask = (task) => {
    setEditingTaskId(task.id);
    setDraftDate(task.date || formatDateOffset(0));
    setDraftTime(task.time || '07:00');
    setDraftBranch(task.branchKey || defaultBranch);
    setDraftGroup(task.groupKey || '');
    setDraftCrop(task.cropKey || '');
    setDraftAction(task.actionKey || '');
    setDraftNote(task.note || '');
    setDraftRepeat(task.repeatRule || 'none');
    setDraftRepeatDays(String(task.repeatDays || '7'));
    setDraftIsUrgent(!!task.isUrgent);
    setModalVisible(true);
    setDraftBranchMenuVisible(false);
    setDraftGroupMenuVisible(false);
    setDraftCropMenuVisible(false);
    setDraftActionMenuVisible(false);
    setDraftRepeatMenuVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const removeTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const toggleDone = (taskId) => {
    setTasks((prev) => {
      const target = prev.find((task) => task.id === taskId);
      if (!target) return prev;

      let updated = prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          done: !task.done,
          completedAt: !task.done ? new Date().toISOString() : '',
        };
      });

      if (!target.done && target.repeatRule && target.repeatRule !== 'none') {
        const nextDate = getNextRepeatDate(target.date, target.repeatRule, target.repeatDays);
        const exists = updated.some(
          (task) =>
            task.parentTaskId === target.id &&
            task.date === nextDate &&
            task.actionKey === target.actionKey
        );

        if (nextDate && !exists) {
          updated = [
            {
              ...target,
              id: `${Date.now()}_${target.id}`,
              date: nextDate,
              done: false,
              completedAt: '',
              createdAt: new Date().toISOString(),
              parentTaskId: target.id,
              smartReminder: getAbGoSmartReminder(
                {
                  branchKey: target.branchKey,
                  actionKey: target.actionKey,
                  subgroupKey: target.groupKey,
                  cropKey: target.cropKey,
                  date: nextDate,
                  time: target.time,
                },
                monitoringData
              ),
            },
            ...updated,
          ];
        }
      }

      return updated;
    });
  };

  const saveTask = () => {
    const branchMeta = branches.find((item) => item.key === draftBranch) || AB_GO_COMMON_CATEGORY;
    const groupMeta = groups.find((item) => item.key === draftGroup);
    const cropMeta = isCommonBranch ? null : crops.find((item) => item.key === draftCrop);
    const actionMeta = actions.find((item) => item.key === draftAction);

    if (!groupMeta || !actionMeta || (!isCommonBranch && !cropMeta)) return;

    const nextTask = {
      id: editingTaskId || `${Date.now()}`,
      date: draftDate,
      time: draftTime,
      branchKey: draftBranch,
      branchLabel: branchMeta.label,
      branchEmoji: branchMeta.emoji,
      groupKey: draftGroup,
      groupLabel: groupMeta.label,
      cropKey: isCommonBranch ? '' : draftCrop,
      cropLabel: isCommonBranch ? '' : cropMeta.label,
      cropEmoji: isCommonBranch ? '' : (cropMeta.emoji || '🌱'),
      actionKey: draftAction,
      actionLabel: actionMeta.label,
      actionEmoji: actionMeta.emoji,
      note: draftNote.trim(),
      repeatRule: draftRepeat,
      repeatDays: draftRepeat === 'custom_days' ? Math.max(1, Number(draftRepeatDays) || 1) : null,
      isUrgent: !!draftIsUrgent,
      smartReminder: getAbGoSmartReminder(
        {
          branchKey: draftBranch,
          groupKey: draftGroup,
          cropKey: draftCrop,
          actionKey: draftAction,
          date: draftDate,
          time: draftTime,
        },
        monitoringData
      ),
      done: false,
      createdAt: editingTaskId ? tasks.find((item) => item.id === editingTaskId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      completedAt: '',
    };

    setTasks((prev) => {
      if (editingTaskId) {
        return prev.map((item) => (item.id === editingTaskId ? { ...item, ...nextTask } : item));
      }
      return [nextTask, ...prev];
    });

    setSelectedBranch(draftBranch);
    setSelectedDate(draftDate);
    setListFilter('day');
    setModalVisible(false);
    resetDraft();
  };

  const renderTaskCard = (task, showDate = false) => {
    const status = getStatusMeta(getStatusByDate(task.date), task.done);

    return (
      <View key={task.id} style={[styles.taskCard, task.done && styles.taskCardDone]}>
        <View style={styles.taskTopRow}>
          <View style={styles.taskTitleWrap}>
            <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
              {task.done ? '✅ ' : ''}
              {task.actionKey === 'custom_note'
                ? `${task.actionEmoji} ${task.note || ''}`.trim()
                : `${task.actionEmoji} ${task.actionLabel}`.trim()}
            </Text>
            <Text style={styles.taskMeta}>
              {task.branchEmoji} {task.branchLabel} / {task.groupLabel}{task.cropLabel ? ` / ${task.cropLabel}` : ''}
            </Text>
            {!!task.repeatRule && task.repeatRule !== 'none' ? (
              <Text style={styles.taskRepeat}>
                🔁 {task.repeatRule === 'custom_days' ? `Svakih ${task.repeatDays || 1} dana` : getRepeatLabel(task.repeatRule)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.taskMetaRow}>
          <View>
            {showDate ? <Text style={styles.taskDateLabel}>{humanDateLabel(task.date)}</Text> : null}
            <Text style={styles.taskDate}>u {task.time}h</Text>
          </View>
          {task.isUrgent ? (
            <View style={styles.urgentFlameWrap}>
              <Text style={styles.urgentFlame}>🔥</Text>
            </View>
          ) : null}
        </View>
        {task.note && task.actionKey !== 'custom_note' ? <Text style={styles.taskNote}>{task.note}</Text> : null}

        <View style={styles.taskActionRow}>
          <TouchableOpacity style={styles.taskEditButton} onPress={() => openEditTask(task)} activeOpacity={0.85}>
            <Text style={styles.taskEditText}>Uredi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.taskToggleButton, task.done && styles.taskToggleButtonDone]}
            onPress={() => toggleDone(task.id)}
            activeOpacity={0.85}
          >
            <Text style={[styles.taskToggleText, task.done && styles.taskToggleTextDone]}>
              {task.done ? 'Vrati u plan' : ' 👉 ✅'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskRemoveButton} onPress={() => removeTask(task.id)} activeOpacity={0.85}>
            <Text style={styles.taskRemoveText}>Ukloni</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.kpiRow}>
          {currentTab === 'active'
            ? kpis.map((card) => (
                <TouchableOpacity
                  key={card.key}
                  style={[styles.kpiCard, { backgroundColor: card.bg }]}
                  onPress={() => {
                    setKpiModalKey(card.key);
                    setKpiModalVisible(true);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.kpiTitle}>{card.title}</Text>
                  <Text style={styles.kpiValue}>{card.value}</Text>
                  <Text style={styles.kpiNote}>{card.note}</Text>
                </TouchableOpacity>
              ))
            : archiveKpis.map((card) => (
                <TouchableOpacity
                  key={card.key}
                  style={[styles.kpiCard, { backgroundColor: card.bg }]}
                  onPress={() => {
                    setKpiModalKey(card.key);
                    setKpiModalVisible(true);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.kpiTitle}>{card.title}</Text>
                  <Text style={styles.kpiValue}>{card.value}</Text>
                  <Text style={styles.kpiNote}>{card.note}</Text>
                </TouchableOpacity>
              ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.topTabsRow}>
            <TouchableOpacity
              style={[styles.topTabButton, currentTab === 'active' && styles.topTabButtonActive]}
              onPress={() => setCurrentTab('active')}
              activeOpacity={0.9}
            >
              <Text style={[styles.topTabText, currentTab === 'active' && styles.topTabTextActive]}>Aktivno</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.topTabButton, currentTab === 'archive' && styles.topTabButtonActive]}
              onPress={() => setCurrentTab('archive')}
              activeOpacity={0.9}
            >
              <Text style={[styles.topTabText, currentTab === 'archive' && styles.topTabTextActive]}>Arhiva</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.topTabButton, styles.topTabButtonAction]}
              onPress={openAddModal}
              activeOpacity={0.9}
            >
              <Text style={[styles.topTabText, styles.topTabTextAction]}>+ Dodaj</Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentTab === 'active' ? (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Kalendar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
                {calendarDates.map((dateValue) => {
                  const active = selectedDate === dateValue;
                  const label = formatCalendarDayLabel(dateValue);
                  return (
                    <TouchableOpacity
                      key={dateValue}
                      style={[styles.calendarChip, active && styles.calendarChipActive]}
                      onPress={() => {
                        setSelectedDate(dateValue);
                        setListFilter('day');
                      }}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.calendarWeekday, active && styles.calendarWeekdayActive]}>
                        {label.weekday}
                      </Text>
                      <Text style={[styles.calendarDate, active && styles.calendarDateActive]}>
                        {label.date}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Djelatnost</Text>

              <TouchableOpacity
                style={styles.dropdownField}
                onPress={() => setBranchMenuVisible((prev) => !prev)}
                activeOpacity={0.9}
              >
                <Text style={styles.dropdownFieldText}>
                  {selectedBranchMeta.emoji} {selectedBranchMeta.label}
                </Text>
                <Text style={styles.dropdownFieldArrow}>{branchMenuVisible ? '▴' : '▾'}</Text>
              </TouchableOpacity>

              {branchMenuVisible ? (
                <View style={styles.dropdownMenu}>
                  {branches.map((branch) => (
                    <TouchableOpacity
                      key={branch.key}
                      style={[
                        styles.dropdownMenuItem,
                        selectedBranch === branch.key && styles.dropdownMenuItemActive,
                      ]}
                      onPress={() => {
                        setSelectedBranch(branch.key);
                        setBranchMenuVisible(false);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text
                        style={[
                          styles.dropdownMenuItemText,
                          selectedBranch === branch.key && styles.dropdownMenuItemTextActive,
                        ]}
                      >
                        {branch.emoji} {branch.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.inlineHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Moje obaveze</Text>
                  <Text style={styles.sectionSubtitle}>Odaberi djelatnost, skupinu, kulturu i radnju pa spremi zadatak.</Text>
                </View>
              </View>

              <View style={styles.filterRow}>
                {LIST_FILTERS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.smallFilterChip, listFilter === item.key && styles.smallFilterChipActive]}
                    onPress={() => setListFilter(item.key)}
                    activeOpacity={0.9}
                  >
                    <Text
                      style={[
                        styles.smallFilterChipText,
                        listFilter === item.key && styles.smallFilterChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {groupedActiveDates.length ? (
                groupedActiveDates.map((dateKey) => (
                  <View key={dateKey} style={styles.groupWrap}>
                    <Text style={styles.groupTitle}>{humanDateLabel(dateKey)}</Text>
                    {groupedActiveTasks[dateKey].map((task) => renderTaskCard(task))}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>Nema obaveza za ovaj prikaz</Text>
                  <Text style={styles.emptyStateText}>Dodaj novu obavezu ili promijeni filter.</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Arhiva zadataka</Text>
            <Text style={styles.sectionSubtitle}>Filtriraj povijest po djelatnosti, skupini, kulturi i radnji.</Text>

            <View style={styles.filterRow}>
              {HISTORY_PERIOD_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.smallFilterChip, historyPeriod === item.key && styles.smallFilterChipActive]}
                  onPress={() => setHistoryPeriod(item.key)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.smallFilterChipText,
                      historyPeriod === item.key && styles.smallFilterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.archiveReportButton}
              onPress={() => setArchiveReportModalVisible(true)}
              activeOpacity={0.9}
            >
              <Text style={styles.archiveReportButtonText}>Izvještaji</Text>
            </TouchableOpacity>

            <Text style={styles.blockLabel}>Djelatnost</Text>
            <TouchableOpacity
              style={styles.dropdownField}
              onPress={() => setHistoryBranchMenuVisible((prev) => !prev)}
              activeOpacity={0.9}
            >
              <Text style={styles.dropdownFieldText}>{historyBranchMeta.emoji} {historyBranchMeta.label}</Text>
              <Text style={styles.dropdownFieldArrow}>{historyBranchMenuVisible ? '▴' : '▾'}</Text>
            </TouchableOpacity>

            {historyBranchMenuVisible ? (
              <View style={styles.dropdownMenu}>
                {historyBranchOptions.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.dropdownMenuItem, historyBranch === item.key && styles.dropdownMenuItemActive]}
                    onPress={() => {
                      setHistoryBranch(item.key);
                      setHistoryGroup('all');
                      setHistoryCrop('all');
                      setHistoryAction('all');
                      setHistoryBranchMenuVisible(false);
                      setHistoryGroupMenuVisible(false);
                      setHistoryCropMenuVisible(false);
                      setHistoryActionMenuVisible(false);
                    }}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.dropdownMenuItemText, historyBranch === item.key && styles.dropdownMenuItemTextActive]}>
                      {item.emoji} {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {showHistoryGroupFilter ? (
              <>
                <Text style={styles.blockLabel}>Skupina</Text>
                <TouchableOpacity
                  style={styles.dropdownField}
                  onPress={() => setHistoryGroupMenuVisible((prev) => !prev)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.dropdownFieldText}>{historyGroupMeta.emoji} {historyGroupMeta.label}</Text>
                  <Text style={styles.dropdownFieldArrow}>{historyGroupMenuVisible ? '▴' : '▾'}</Text>
                </TouchableOpacity>

                {historyGroupMenuVisible ? (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={[styles.dropdownMenuItem, historyGroup === 'all' && styles.dropdownMenuItemActive]}
                      onPress={() => {
                        setHistoryGroup('all');
                        setHistoryCrop('all');
                        setHistoryAction('all');
                        setHistoryGroupMenuVisible(false);
                        setHistoryCropMenuVisible(false);
                        setHistoryActionMenuVisible(false);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.dropdownMenuItemText, historyGroup === 'all' && styles.dropdownMenuItemTextActive]}>
                        📁 Sve skupine
                      </Text>
                    </TouchableOpacity>

                    {historyGroups.map((item) => (
                      <TouchableOpacity
                        key={`${item.branchKey || historyBranch}_${item.key}`}
                        style={[styles.dropdownMenuItem, historyGroup === item.key && styles.dropdownMenuItemActive]}
                        onPress={() => {
                          setHistoryGroup(item.key);
                          setHistoryCrop('all');
                          setHistoryAction('all');
                          setHistoryGroupMenuVisible(false);
                          setHistoryCropMenuVisible(false);
                          setHistoryActionMenuVisible(false);
                        }}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.dropdownMenuItemText, historyGroup === item.key && styles.dropdownMenuItemTextActive]}>
                          {item.emoji} {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}

            {showHistoryCropFilter ? (
              <>
                <Text style={styles.blockLabel}>Kultura</Text>
                <TouchableOpacity
                  style={styles.dropdownField}
                  onPress={() => setHistoryCropMenuVisible((prev) => !prev)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.dropdownFieldText}>{historyCropMeta.emoji} {historyCropMeta.label}</Text>
                  <Text style={styles.dropdownFieldArrow}>{historyCropMenuVisible ? '▴' : '▾'}</Text>
                </TouchableOpacity>

                {historyCropMenuVisible ? (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={[styles.dropdownMenuItem, historyCrop === 'all' && styles.dropdownMenuItemActive]}
                      onPress={() => {
                        setHistoryCrop('all');
                        setHistoryAction('all');
                        setHistoryCropMenuVisible(false);
                        setHistoryActionMenuVisible(false);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.dropdownMenuItemText, historyCrop === 'all' && styles.dropdownMenuItemTextActive]}>
                        🌱 Sve kulture
                      </Text>
                    </TouchableOpacity>

                    {historyCrops.map((item) => (
                      <TouchableOpacity
                        key={`${item.groupKey || historyGroup}_${item.key}`}
                        style={[styles.dropdownMenuItem, historyCrop === item.key && styles.dropdownMenuItemActive]}
                        onPress={() => {
                          setHistoryCrop(item.key);
                          setHistoryAction('all');
                          setHistoryCropMenuVisible(false);
                          setHistoryActionMenuVisible(false);
                        }}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.dropdownMenuItemText, historyCrop === item.key && styles.dropdownMenuItemTextActive]}>
                          {item.emoji || '🌱'} {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}

            {showHistoryActionFilter ? (
              <>
                <Text style={styles.blockLabel}>Radnja</Text>
                <TouchableOpacity
                  style={styles.dropdownField}
                  onPress={() => setHistoryActionMenuVisible((prev) => !prev)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.dropdownFieldText}>{historyActionMeta.emoji} {historyActionMeta.label}</Text>
                  <Text style={styles.dropdownFieldArrow}>{historyActionMenuVisible ? '▴' : '▾'}</Text>
                </TouchableOpacity>

                {historyActionMenuVisible ? (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={[styles.dropdownMenuItem, historyAction === 'all' && styles.dropdownMenuItemActive]}
                      onPress={() => {
                        setHistoryAction('all');
                        setHistoryActionMenuVisible(false);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.dropdownMenuItemText, historyAction === 'all' && styles.dropdownMenuItemTextActive]}>
                        🛠️ Sve radnje
                      </Text>
                    </TouchableOpacity>

                    {historyActions.map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.dropdownMenuItem, historyAction === item.key && styles.dropdownMenuItemActive]}
                        onPress={() => {
                          setHistoryAction(item.key);
                          setHistoryActionMenuVisible(false);
                        }}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.dropdownMenuItemText, historyAction === item.key && styles.dropdownMenuItemTextActive]}>
                          {item.emoji} {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}

            <Text style={styles.blockLabel}>Status</Text>
            <View style={styles.filterRow}>
              {HISTORY_STATUS_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.smallFilterChip, historyStatus === item.key && styles.smallFilterChipActive]}
                  onPress={() => setHistoryStatus(item.key)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.smallFilterChipText,
                      historyStatus === item.key && styles.smallFilterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {groupedHistoryDates.length ? (
              groupedHistoryDates.map((dateKey) => (
                <View key={dateKey} style={styles.groupWrap}>
                  <Text style={styles.groupTitle}>{humanDateLabel(dateKey)}</Text>
                  {groupedHistoryTasks[dateKey].map((task) => renderTaskCard(task))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nema zadataka za odabrane filtere</Text>
                <Text style={styles.emptyStateText}>Promijeni filtere i pokušaj ponovno.</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      <Modal
        visible={archiveReportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setArchiveReportModalVisible(false)}
      >
        <View style={styles.kpiModalOverlay}>
          <TouchableOpacity
            style={styles.kpiModalBackdrop}
            activeOpacity={1}
            onPress={() => setArchiveReportModalVisible(false)}
          />
          <View style={styles.archiveReportModalCard}>
            <View style={styles.archiveReportHeader}>
              <View style={styles.archiveReportBadge}>
                <Text style={styles.archiveReportBadgeText}>PDF</Text>
              </View>
              <View style={styles.archiveReportHeaderText}>
                <Text style={styles.kpiModalTitle}>Izvještaji</Text>
                <Text style={styles.kpiModalSubtitle}>Pregled arhive i izvoz u PDF za odabrani filter.</Text>
              </View>
            </View>

            <View style={styles.reportPeriodTabs}>
              {REPORT_PERIOD_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.reportPeriodTab, historyPeriod === item.key && styles.reportPeriodTabActive]}
                  onPress={() => setHistoryPeriod(item.key)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.reportPeriodTabText,
                      historyPeriod === item.key && styles.reportPeriodTabTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.archivePeriodBar}>
              {historyPeriod !== 'all' ? (
                <TouchableOpacity
                  style={styles.archivePeriodButton}
                  onPress={() => {
                    setHistoryPeriodAnchor((prev) => shiftArchivePeriod(prev, historyPeriod, -1));
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.archivePeriodButtonText}>{'<'}</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.archivePeriodTitle}>{archivePeriodLabel}</Text>

              {historyPeriod !== 'all' ? (
                <TouchableOpacity
                  style={styles.archivePeriodButton}
                  onPress={() => {
                    setHistoryPeriodAnchor((prev) => shiftArchivePeriod(prev, historyPeriod, 1));
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.archivePeriodButtonText}>{'>'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.archiveSummaryCard}>
              <Text style={styles.archiveReportTitle}>{archiveReportTitle}</Text>
              <Text style={styles.archiveReportPeriod}>{archivePeriodLabel}</Text>

              <View style={styles.archiveReportKpiRow}>
                <View style={styles.archiveReportKpiCard}>
                  <Text style={styles.archiveReportItemLabel}>Ukupno</Text>
                  <Text style={styles.archiveReportItemValue}>{archiveStats.total}</Text>
                </View>
                <View style={styles.archiveReportKpiCard}>
                  <Text style={styles.archiveReportItemLabel}>Riješeno</Text>
                  <Text style={styles.archiveReportItemValue}>{archiveStats.done}</Text>
                </View>
                <View style={styles.archiveReportKpiCard}>
                  <Text style={styles.archiveReportItemLabel}>Otvoreno</Text>
                  <Text style={styles.archiveReportItemValue}>{archiveStats.open}</Text>
                </View>
              </View>

              <View style={styles.archiveInsightBox}>
                <Text style={styles.archiveReportItemLabel}>Najčešća djelatnost</Text>
                <Text style={styles.archiveInsightValue}>{archiveStats.topBranch}</Text>
              </View>

              <View style={styles.archiveInsightBox}>
                <Text style={styles.archiveReportItemLabel}>Najčešća radnja</Text>
                <Text style={styles.archiveInsightValue}>{archiveStats.topAction}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.archivePdfButton, archivePdfLoading && styles.archivePdfButtonDisabled]}
              onPress={exportArchiveReportPdf}
              disabled={archivePdfLoading}
              activeOpacity={0.9}
            >
              <Text style={styles.archivePdfButtonText}>
                {archivePdfLoading ? 'Izrada PDF-a...' : 'Preuzmi PDF izvještaj'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.kpiModalCloseButton}
              onPress={() => setArchiveReportModalVisible(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.kpiModalCloseText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={kpiModalVisible} transparent animationType="fade" onRequestClose={() => setKpiModalVisible(false)}>
        <View style={styles.kpiModalOverlay}>
          <TouchableOpacity style={styles.kpiModalBackdrop} activeOpacity={1} onPress={() => setKpiModalVisible(false)} />
          <View style={styles.kpiModalCard}>
            <Text style={styles.kpiModalTitle}>{kpiModalTitle}</Text>
            <Text style={styles.kpiModalSubtitle}>Obaveze prema odabranoj KPI kartici.</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
              {kpiModalTasks.length ? (
                kpiModalTasks.map((task) => renderTaskCard(task, true))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>Nema obaveza za ovaj filter</Text>
                  <Text style={styles.emptyStateText}>Ovdje će se prikazati filtrirane obaveze.</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.kpiModalCloseButton} onPress={() => setKpiModalVisible(false)} activeOpacity={0.9}>
              <Text style={styles.kpiModalCloseText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{editingTaskId ? 'Uredi obavezu' : 'Dodaj obavezu'}</Text>

              <Text style={styles.blockLabel}>Djelatnost</Text>
              <TouchableOpacity
                style={styles.dropdownField}
                onPress={() => setDraftBranchMenuVisible((prev) => !prev)}
                activeOpacity={0.9}
              >
                <Text style={styles.dropdownFieldText}>
                  {draftBranch ? `${draftBranchMeta.emoji} ${draftBranchMeta.label}` : 'Odaberi djelatnost'}
                </Text>
                <Text style={styles.dropdownFieldArrow}>{draftBranchMenuVisible ? '▴' : '▾'}</Text>
              </TouchableOpacity>

              {draftBranchMenuVisible ? (
                <View style={styles.dropdownMenu}>
                  {branches.map((branch) => (
                    <TouchableOpacity
                      key={branch.key}
                      style={[styles.dropdownMenuItem, draftBranch === branch.key && styles.dropdownMenuItemActive]}
                      onPress={() => {
                        setDraftBranch(branch.key);
                        setDraftGroup('');
                        setDraftCrop('');
                        setDraftAction('');
                        setDraftBranchMenuVisible(false);
                        setDraftGroupMenuVisible(false);
                        setDraftCropMenuVisible(false);
                        setDraftActionMenuVisible(false);
                      }}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.dropdownMenuItemText, draftBranch === branch.key && styles.dropdownMenuItemTextActive]}>
                        {branch.emoji} {branch.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {showDraftGroupFilter ? (
                <>
                  <Text style={styles.blockLabel}>Skupina</Text>
                  <TouchableOpacity
                    style={styles.dropdownField}
                    onPress={() => setDraftGroupMenuVisible((prev) => !prev)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.dropdownFieldText}>
                      {draftGroupMeta?.emoji || '📁'} {draftGroupMeta?.label || 'Odaberi skupinu'}
                    </Text>
                    <Text style={styles.dropdownFieldArrow}>{draftGroupMenuVisible ? '▴' : '▾'}</Text>
                  </TouchableOpacity>

                  {draftGroupMenuVisible ? (
                    <View style={styles.dropdownMenu}>
                      {groups.map((item) => (
                        <TouchableOpacity
                          key={item.key}
                          style={[styles.dropdownMenuItem, draftGroup === item.key && styles.dropdownMenuItemActive]}
                          onPress={() => {
                            setDraftGroup(item.key);
                            setDraftCrop('');
                            setDraftAction('');
                            setDraftGroupMenuVisible(false);
                            setDraftCropMenuVisible(false);
                            setDraftActionMenuVisible(false);
                          }}
                          activeOpacity={0.9}
                        >
                          <Text style={[styles.dropdownMenuItemText, draftGroup === item.key && styles.dropdownMenuItemTextActive]}>
                            {item.emoji} {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}

              {showDraftCropFilter ? (
                <>
                  <Text style={styles.blockLabel}>Kultura / segment</Text>
                  <TouchableOpacity
                    style={styles.dropdownField}
                    onPress={() => setDraftCropMenuVisible((prev) => !prev)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.dropdownFieldText}>
                      {draftCropMeta?.emoji || '🌱'} {draftCropMeta?.label || 'Odaberi kulturu'}
                    </Text>
                    <Text style={styles.dropdownFieldArrow}>{draftCropMenuVisible ? '▴' : '▾'}</Text>
                  </TouchableOpacity>

                  {draftCropMenuVisible ? (
                    <View style={styles.dropdownMenu}>
                      {crops.map((item) => (
                        <TouchableOpacity
                          key={item.key}
                          style={[styles.dropdownMenuItem, draftCrop === item.key && styles.dropdownMenuItemActive]}
                          onPress={() => {
                            setDraftCrop(item.key);
                            setDraftAction('');
                            setDraftCropMenuVisible(false);
                            setDraftActionMenuVisible(false);
                          }}
                          activeOpacity={0.9}
                        >
                          <Text style={[styles.dropdownMenuItemText, draftCrop === item.key && styles.dropdownMenuItemTextActive]}>
                            {item.emoji || '🌱'} {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}

              {showDraftActionFilter ? (
                <>
                  <Text style={styles.blockLabel}>Radnja</Text>
                  <TouchableOpacity
                    style={styles.dropdownField}
                    onPress={() => setDraftActionMenuVisible((prev) => !prev)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.dropdownFieldText}>
                      {draftActionMeta ? `${draftActionMeta.emoji} ${draftActionMeta.label || 'Vlastita napomena'}` : 'Odaberi radnju'}
                    </Text>
                    <Text style={styles.dropdownFieldArrow}>{draftActionMenuVisible ? '▴' : '▾'}</Text>
                  </TouchableOpacity>

                  {draftActionMenuVisible ? (
                    <View style={styles.dropdownMenu}>
                      {actions.map((item) => (
                        <TouchableOpacity
                          key={item.key}
                          style={[styles.dropdownMenuItem, draftAction === item.key && styles.dropdownMenuItemActive]}
                          onPress={() => {
                            setDraftAction(item.key);
                            setDraftActionMenuVisible(false);
                          }}
                          activeOpacity={0.9}
                        >
                          <Text style={[styles.dropdownMenuItemText, draftAction === item.key && styles.dropdownMenuItemTextActive]}>
                            {item.emoji} {item.label || 'Vlastita napomena'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}

              {draftAction ? (
                <>
                  <Text style={styles.blockLabel}>Datum</Text>
                  <TouchableOpacity
                    style={styles.readOnlyField}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.readOnlyFieldText}>{formatCroatianDate(draftDate)}</Text>
                  </TouchableOpacity>

                  <Text style={styles.blockLabel}>Vrijeme</Text>
                  <TouchableOpacity
                    style={styles.readOnlyField}
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.readOnlyFieldText}>{formatDisplayTime(draftTime)}</Text>
                  </TouchableOpacity>

                  <View style={styles.dualFieldRow}>
                    <View style={styles.repeatFieldWrap}>
                      <Text style={styles.blockLabel}>Ponavljanje</Text>
                      <TouchableOpacity
                        style={[styles.dropdownField, styles.compactDropdownField, styles.dropdownFieldActive, draftRepeatMenuVisible && styles.compactDropdownFieldOpen]}
                        onPress={() => setDraftRepeatMenuVisible((prev) => !prev)}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.dropdownFieldText, styles.compactDropdownText]}>
                          {REPEAT_OPTIONS.find((item) => item.key === draftRepeat)?.label || 'Bez ponavljanja'}
                        </Text>
                        <Text style={styles.dropdownFieldArrow}>{draftRepeatMenuVisible ? '▴' : '▾'}</Text>
                      </TouchableOpacity>

                      {draftRepeatMenuVisible ? (
                        <View style={[styles.dropdownMenu, styles.compactDropdownMenu]}>
                          {REPEAT_OPTIONS.map((item) => (
                            <TouchableOpacity
                              key={item.key}
                              style={[styles.dropdownMenuItem, draftRepeat === item.key && styles.dropdownMenuItemActive]}
                              onPress={() => {
                                setDraftRepeat(item.key);
                                if (item.key === 'custom_days' && !draftRepeatDays) setDraftRepeatDays('7');
                                setDraftRepeatMenuVisible(false);
                              }}
                              activeOpacity={0.9}
                            >
                              <Text style={[styles.dropdownMenuItemText, draftRepeat === item.key && styles.dropdownMenuItemTextActive]}>
                                {item.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.priorityFieldWrap}>
                      <Text style={[styles.blockLabel, styles.priorityBlockLabel]}>Prioritet</Text>
                      <TouchableOpacity
                        style={[styles.priorityChip, draftIsUrgent && styles.priorityChipActive]}
                        onPress={() => setDraftIsUrgent((prev) => !prev)}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.priorityChipText, draftIsUrgent && styles.priorityChipTextActive]}>
                          🔥 Hitno
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {draftRepeat === 'custom_days' ? (
                    <>
                      <Text style={styles.blockLabel}>Broj dana</Text>
                      <TextInput
                        value={draftRepeatDays}
                        onChangeText={setDraftRepeatDays}
                        placeholder="npr. 3"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        style={styles.inlineInput}
                      />
                    </>
                  ) : null}

                  <Text style={styles.blockLabel}>Napomena</Text>
                  <TextInput
                    value={draftNote}
                    onChangeText={setDraftNote}
                    placeholder={draftAction === 'custom_note' ? 'Unesi opis radnje...' : 'Kratka napomena'}
                    placeholderTextColor="#94A3B8"
                    style={styles.inlineInput}
                  />
                </>
              ) : null}

              {showDatePicker ? (
                <DateTimePicker
                  value={toLocalDate(draftDate) || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event?.type === 'dismissed' || !selectedDate) return;
                    setDraftDate(toIsoDate(selectedDate));
                  }}
                />
              ) : null}

              {showTimePicker ? (
                <DateTimePicker
                  value={timeStringToDate(draftTime)}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (event?.type === 'dismissed' || !selectedDate) return;
                    const h = `${selectedDate.getHours()}`.padStart(2, '0');
                    const m = `${selectedDate.getMinutes()}`.padStart(2, '0');
                    setDraftTime(`${h}:${m}`);
                  }}
                />
              ) : null}

              {draftAction ? (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveTask}
                  activeOpacity={0.9}
                >
                  <Text style={styles.saveButtonText}>{editingTaskId ? 'Spremi izmjene' : 'Spremi obavezu'}</Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  kpiNote: {
    fontSize: 12,
    color: '#475569',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    marginBottom: 14,
  },
  topTabsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  topTabButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  topTabButtonActive: {
    backgroundColor: '#EEF6DF',
    borderWidth: 1,
    borderColor: '#CFE19A',
  },
  topTabButtonAction: {
    backgroundColor: '#7FA52A',
  },
  topTabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    textAlign: 'center',
  },
  topTabTextActive: {
    color: '#5E7A16',
  },
  topTabTextAction: {
    color: '#FFFFFF',
  },
  dropdownField: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dropdownFieldText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    paddingRight: 12,
  },
  dropdownFieldArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748B',
  },
  dropdownMenu: {
    marginTop: -4,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF6DF',
  },
  dropdownMenuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  dropdownMenuItemTextActive: {
    color: '#5E7A16',
  },
  calendarRow: {
    paddingRight: 6,
  },
  calendarChip: {
    width: 96,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    alignItems: 'center',
  },
  calendarChipActive: {
    backgroundColor: '#EEF6DF',
    borderColor: '#CFE19A',
  },
  calendarWeekday: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 3,
    textAlign: 'center',
  },
  calendarWeekdayActive: {
    color: '#5E7A16',
  },
  calendarDate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  calendarDateActive: {
    color: '#5E7A16',
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  smallFilterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
  },
  smallFilterChipActive: {
    backgroundColor: '#7FA52A',
  },
  smallFilterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  smallFilterChipTextActive: {
    color: '#FFFFFF',
  },
  groupWrap: {
    marginTop: 6,
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5E7A16',
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  taskCardDone: {
    opacity: 0.92,
  },
  taskTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  taskTitleDone: {
    color: '#64748B',
  },
  taskMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  taskRepeat: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E7A16',
    marginTop: 3,
  },
  taskDate: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 0,
  },
  taskDateLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5E7A16',
    marginBottom: 4,
  },

  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentFlameWrap: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4E8',
    borderWidth: 1,
    borderColor: '#F8D7B8',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  urgentFlame: {
    fontSize: 26,
  },

  taskNote: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    marginBottom: 10,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  smartReminderBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  smartReminderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 4,
  },
  smartReminderText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7C2D12',
  },
  taskActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  taskEditButton: {
    minWidth: 72,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  taskEditText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  taskToggleButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: '#EEF6DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  taskToggleButtonDone: {
    backgroundColor: '#E0E7FF',
  },
  taskToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5E7A16',
  },
  taskToggleTextDone: {
    color: '#3730A3',
  },
  taskRemoveButton: {
    minWidth: 84,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskRemoveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B91C1C',
  },
  emptyState: {
    paddingVertical: 10,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },
  archiveSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  archiveSummaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    marginBottom: 4,
  },
  archiveSummaryStrong: {
    fontWeight: '800',
    color: '#111827',
  },
  archivePeriodBar: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  archivePeriodTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  archivePeriodButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#EEF6DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivePeriodButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#5E7A16',
    lineHeight: 26,
  },
  archiveReportButton: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: '#7FA52A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  archiveReportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  archiveReportTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  archiveReportModalCard: {
    width: '90%',
    maxHeight: '86%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
  },
  archiveReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  archiveReportBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF6DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  archiveReportBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#5E7A16',
  },
  archiveReportHeaderText: {
    flex: 1,
  },
  reportPeriodTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reportPeriodTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  reportPeriodTabActive: {
    backgroundColor: '#7FA52A',
  },
  reportPeriodTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  reportPeriodTabTextActive: {
    color: '#FFFFFF',
  },
  archiveReportPeriod: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
  },
  archiveReportKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  archiveReportKpiCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    justifyContent: 'space-between',
  },
  archiveReportItemLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  archiveReportItemValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  archiveInsightBox: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 8,
  },
  archiveInsightValue: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
    color: '#111827',
  },
  archivePdfButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  archivePdfButtonDisabled: {
    opacity: 0.6,
  },
  archivePdfButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 16,
    height: '88%',
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalHandle: {
    width: 74,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  blockLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    marginTop: 2,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
  },
  optionChipActive: {
    backgroundColor: '#7FA52A',
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
  },
  inlineInput: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  readOnlyField: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 12,
  },
  readOnlyFieldText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#7FA52A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  dualFieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  repeatFieldWrap: {
    flex: 1,
    marginRight: 12,
  },
  priorityFieldWrap: {
    width: 118,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  priorityBlockLabel: {
    textAlign: 'center',
  },
  compactDropdownField: {
    minHeight: 56,
    marginBottom: 0,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  compactDropdownFieldOpen: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  compactDropdownText: {
    color: '#667A1F',
    fontSize: 14,
    fontWeight: '800',
  },
  compactDropdownMenu: {
    marginTop: 8,
    borderRadius: 20,
  },
  priorityChip: {
    minHeight: 50,
    minWidth: 118,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  priorityChipActive: {
    backgroundColor: '#EEF6DF',
    borderWidth: 1,
    borderColor: '#CFE19A',
  },
  priorityChipText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  priorityChipTextActive: {
    color: '#5E7A16',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kpiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  kpiModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  kpiModalCard: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
  },
  kpiModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  kpiModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  kpiModalCloseButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#7FA52A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  kpiModalCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

});