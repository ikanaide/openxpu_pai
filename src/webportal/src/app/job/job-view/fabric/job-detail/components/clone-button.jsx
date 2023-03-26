// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import qs from 'querystring';
import { get, isNil } from 'lodash';
import { PrimaryButton } from 'office-ui-fabric-react';
import { isClonable, isJobV2, isJobSingle } from '../util';
import Context from './context';

const CloneButton = ({ rawJobConfig, namespace, jobName, enableTransfer }) => {
  const [href, onClick] = useMemo(() => {
    // TODO: align same format of jobname with each submit ways
    const queryOld = {
      op: 'resubmit',
      single: isJobSingle(rawJobConfig),
      type: 'job',
      user: namespace,
      jobname: jobName,
    };
    const queryNew = {
      op: 'resubmit',
      single: isJobSingle(rawJobConfig),
      type: 'job',
      user: namespace,
      jobName: jobName,
    };
    const pluginId = get(rawJobConfig, 'extras.submitFrom');
    // default
    if (isNil(pluginId)) {
      if (isJobV2(rawJobConfig)) {
        // give a dummy function for onClick because split button depends on it to work
        return [`/submit.html?${qs.stringify(queryNew)}`, () => {}];
      } else {
        // give a dummy function for onClick because split button depends on it to work
        return [`/submit_v1.html?${qs.stringify(queryNew)}`, () => {}];
      }
    }
    // plugin
    const plugins = window.PAI_PLUGINS;
    const pluginIndex = plugins.findIndex(x => x.id === pluginId);
    // plugin not found
    if (pluginIndex === -1) {
      if (isJobV2(rawJobConfig)) {
        // redirect v2 job to default submission page
        return [
          undefined,
          () => {
            alert(
              `The job was submitted by ${pluginId}, but it is not installed. Will use default submission page instead`,
            );
            window.location.href = `/submit.html?${qs.stringify(queryNew)}`;
          },
        ];
      } else {
        // ignore v1 job
        return [
          undefined,
          () => {
            alert(
              `Clone job failed. The job was submitted by ${pluginId}, but it is not installed.`,
            );
          },
        ];
      }
    }
    // plugin found
    return [
      `/plugin.html?${qs.stringify({
        ...queryOld,
        index: pluginIndex,
      })}`,
      undefined,
    ];
  }, [rawJobConfig]);

  let cloneButton;
  // Only when transfer job is enabled, and the owner of this job is the one
  // who is viewing it, show the transfer option.
  const { isViewingSelf } = useContext(Context);
  if (enableTransfer && isViewingSelf) {
    cloneButton = (
      <PrimaryButton
        text='Clone'
        split
        menuProps={{
          items: [
            {
              key: 'transfer',
              text: 'Transfer',
              iconProps: { iconName: 'Forward' },
              onClick: () => {
                const query = {
                  userName: namespace,
                  jobName: jobName,
                };
                window.location.href = `job-transfer.html?${qs.stringify(
                  query,
                )}`;
              },
            },
          ],
        }}
        href={href}
        onClick={onClick}
        disabled={!isClonable(rawJobConfig)}
      />
    );
  } else {
    cloneButton = (
      <PrimaryButton
        text='Clone'
        href={href}
        onClick={onClick}
        disabled={!isClonable(rawJobConfig)}
      />
    );
  }

  return cloneButton;
};

CloneButton.propTypes = {
  rawJobConfig: PropTypes.object.isRequired,
  namespace: PropTypes.string.isRequired,
  jobName: PropTypes.string.isRequired,
};

export default CloneButton;
