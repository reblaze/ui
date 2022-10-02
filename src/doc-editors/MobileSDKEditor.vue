<template>
<div class="card mobilesdk collapsible-card" :class="{ collapsed: isMobileSdkCollapsed }">
    <div class="card-content px-0 py-0">
        <div class="media collapsible px-5 py-5 mb-0" @click="isMobileSdkCollapsed = !isMobileSdkCollapsed">
            <div class="media-content">
                <p class="title is-5 is-uppercase">Mobile SDK settings</p>
            </div>
            <span v-show="isMobileSdkCollapsed">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
            <span v-show="!isMobileSdkCollapsed">
                <i class="fas fa-angle-up" aria-hidden="true"></i>
            </span>
        </div>

        <div class="collapsible-content pb-5 px-5" id="mobilSdkContent">
            <div class="content">
                <div class="columns">
                    <div class="column">

                        <p class="subtitle is-6 is-uppercase">App Signatures</p>

                        <div class="content">
                            <table class="table is-narrow">
                                <thead>
                                <tr>
                                    <th class="is-size-7 is-360-px">Name</th>
                                    <th class="is-size-7 is-500-px">Hash</th>
                                    <th class="is-size-7 has-text-centered pr-2">Active</th>
                                    <th class="is-size-7 w-94 has-text-right">
                                        <a
                                            class="has-text-grey-dark is-small has-tooltip-left has-tooltip-multiline"
                                            title="Add a signature"
                                            data-tooltip="Add a signature"
                                            @click="openAddSignatureMode"
                                        >
                                            <span class="icon is-small">
                                                <i class="fas fa-plus"></i>
                                            </span>
                                        </a>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(signature,key) in appSignatures" :key="key">
                                    <td class="is-size-7 is-360-px" :title="signature.name">
                                        {{! signature.name }}
                                    </td>
                                    <td class="is-size-7 is-500-px" :title="signature.hash">
                                        <div > <!-- TODO: style="overflow: hidden; max-height: 1.1em;" -->
                                            {{! signature.hash }}
                                        </div>
                                    </td>
                                    <td class="is-size-7 has-text-centered">
                                        <input
                                            type="checkbox"
                                            v-model="signature.active"
                                            :checked="signature.active"
                                        />
                                    </td>
                                    <td class="is-size-7 w-94 has-text-right">
                                        <a
                                            class="is-small has-text-grey"
                                            title="remove signature"
                                            @click="removeSignature(key)"
                                        >
                                            remove
                                        </a>
                                    </td>
                                </tr>
                                <tr v-if="addSignatureMode">
                                    <td class="is-size-7 is-360-px">
                                        <input
                                            type="text"
                                            class="input is-small"
                                            :class="{'is-danger': isError ( 'signName-' )}"
                                            :value="newSignature.name"
                                            @input="editSignatureName"
                                            ref="newSignature"
                                        />
                                        <p v-if="isError ( 'signName-' )" class="help is-danger">
                                            A signature with this name already exists
                                        </p>
                                        <p v-if="isError ( 'signName-empty' )" class="help is-danger">
                                            A signature name cannot be empty
                                        </p>
                                    </td>
                                    <td class="is-size-7 is-360-px">
                                        <input
                                            class="input is-small"
                                            :class="{'is-danger': isError ( 'signHash-' )}"
                                            v-model="newSignature.hash"
                                            @input="editSignatureHash"
                                        />
                                        <p v-if="isError ( 'signHash-' )" class="help is-danger">
                                            Signature should be a hexadecimal string, first 7 characters must not repeat
                                        </p>
                                    </td>
                                    <td class="is-size-7 is-vcentered has-text-centered">
                                        <input
                                            type="checkbox"
                                            v-model="newSignature.active"
                                            :checked="newSignature.active"
                                        />
                                    </td>
                                    <td class="is-size-7 w-94 is-vcentered has-text-right">
                                        <a class="is-small has-text-grey" title="add signature" @click="addSignature">
                                            add
                                        </a>
                                        |
                                        <a class="is-small has-text-grey" @click="cancelSignature">
                                            cancel
                                        </a>
                                    </td>
                                </tr>
                                <tr v-else-if="!appSignatures.length">
                                    <td colspan="4">
                                        <p class="is-size-7 has-text-grey has-text-centered">
                                            No signatures added yet
                                        </p>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <p class="subtitle is-6 is-uppercase">Profiles</p>

                        <div class="content">
                            <table class="table is-narrow">
                                <thead>
                                <tr>
                                    <th class="is-size-7 is-360-px">Name</th>
                                    <th class="is-size-7 is-500-px"></th>
                                    <th class="is-size-7 has-text-centered pr-2">Active</th>
                                    <th class="is-size-7 w-94 has-text-right">
                                        <a
                                            class="has-text-grey-dark is-small has-tooltip-left has-tooltip-multiline"
                                            title="Add a configuration profile"
                                            data-tooltip="Add a configuration profile"
                                            @click="openAddConfigMode"
                                        >
                                            <span class="icon is-small">
                                                <i class="fas fa-plus"></i>
                                            </span>
                                        </a>
                                    </th>
                                </tr>
                                </thead>
                                <tbody v-for="(config,key) in appConfigurations" :key="key">
                                <tr :class="{'has-background-light': seeConfig === key}">
                                    <td
                                        class="is-size-7 is-360-px has-row-clickable"
                                        :title="config.name"
                                        @click="({ target }) => target.type ? false : toggleConfig ( key )"
                                    >
                                        <div v-if="seeConfig === key && ( !isDefaultConfig ( config ) || key )">
                                            <input
                                                class="input is-small"
                                                :class="{'is-danger': isError ( `configName-${key}` )}"
                                                type="text"
                                                :value="config.name"
                                                @input="editConfigName ( $event, key )"
                                            />
                                            <p v-if="isError ( `configName-${key}` )" class="help is-danger">
                                                A profile with this name already exists
                                            </p>
                                        </div>
                                        <span v-else>{{! config.name }}</span>
                                    </td>
                                    <td
                                        class="is-size-7 is-500-px has-row-clickable"
                                        @click="({ target }) => target.classList.contains ( 'textarea' ) ? false : toggleConfig ( key )"
                                    >
                                        <textarea
                                            v-if="seeConfig === key"
                                            rows="7"
                                            class="textarea is-small is-fullwidth json-textarea"
                                            :class="{'is-danger': isError ( `json-${key}` )}"
                                            placeholder="Paste the JSON"
                                            :value="config.json"
                                            @input="editConfig ( $event, key )"
                                            :disabled="isDefaultConfig ( config ) && !key"
                                        ></textarea>
                                    </td>
                                    <td class="is-size-7 has-text-centered has-row-clickable"
                                        @click="({ target }) => target.type ? false : toggleConfig ( key )">
                                        <input type="radio" :checked="config.active"
                                                @change="activateConfig ( $event, key )">
                                    </td>
                                    <td class="is-size-7 w-94 has-row-clickable close-remove has-text-right"
                                        @click="toggleConfig ( key )">
                                        <a class="is-small has-text-grey" title="more details">
                                            {{! seeConfig === key ? 'close' : 'expand' }}
                                        </a>
                                        <button
                                            title="Remove this configuration"
                                            class="button x-is-text is-small is-pulled-right is-danger is-light"
                                            @click="removeConfig(key)"
                                            v-if="seeConfig === key && ( !isDefaultConfig ( config ) || key )"
                                        >
                                            delete
                                        </button>
                                    </td>
                                </tr>
                                </tbody>
                                <tbody v-if="!appConfigurations?.length && !addConfigMode">
                                <tr>
                                    <td colspan="4">
                                        <p class="is-size-7 has-text-grey has-text-centered">
                                            No configurations added yet
                                        </p>
                                    </td>
                                </tr>
                                </tbody>
                                <tfoot>
                                <tr v-if="addConfigMode">
                                    <td class="is-size-7 is-360-px">
                                        <input
                                            class="input is-small"
                                            :class="{'is-danger': isError ( 'configName-' )}"
                                            type="text"
                                            :value="newConfig.name"
                                            @input="editConfigName"
                                            ref="newConfig"
                                            placeholder="Configuration name"
                                        />
                                        <p v-if="isError ( 'configName-' )" class="help is-danger">
                                            A profile with this name already exists
                                        </p>
                                    </td>
                                    <td class="is-size-7 is-500-px">
                                        <textarea
                                                rows="7"
                                                class="textarea is-small is-fullwidth"
                                                :class="{'is-danger': isError ( 'json-' )}"
                                                placeholder="Paste the JSON"
                                                :value="newConfig.json"
                                                @input="editConfig"
                                        ></textarea>
                                    </td>
                                    <td class="is-size-7 has-text-centered is-vcentered">
                                        <input type="radio" :checked="newConfig.active"/>
                                    </td>
                                    <td class="is-size-7 w-94 is-vcentered has-text-right">
                                        <a class="is-small has-text-grey" title="add configuration" @click="addConfig">
                                            add
                                        </a>
                                        |
                                        <a class="is-small has-text-grey" @click="cancelConfig">
                                            cancel
                                        </a>
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="columns">
                    <div class="column is-6">
                        <field
                            v-model="current_site.config.globals.custom_challenge.grace"
                            label="Grace Period"
                            addon="seconds"
                            :error="isError ( 'grace' )"
                        >
                            Number of seconds considered as "grace time" for late arrivals of signatures
                        </field>
                    </div>
                    <div class="column is-6">
                        <field
                            v-model="current_site.config.globals.custom_challenge.uid_header"
                            label="Token Header Name"
                            :error="errors.includes ( 'uidheadername' )"
                        >
                            The header that contains a user or session authentication token
                        </field>
                    </div>
                </div>
            </div>

            <div class="content">
                <fieldset class="fieldset challenge" :class="{collapsedOldParams: !isOldParamsEnabled}">
                    <legend>v1.9.2 and earlier ({{! isOldParamsEnabled ? 'enabled' : 'disabled' }})</legend>
                    <div class="columns">
                        <div class="column">
                            <div class="field">
                                <label class="label is-small">Secret</label>
                                <div class="control">
                                    <input
                                        type="text"
                                        title="Double-click to reveal"
                                        @dblclick="revealSecret"
                                        class="input is-small secret"
                                        :readonly="!revealed"
                                        v-model="secret"
                                    />
                                </div>
                                <p class="help">Double-click to reveal</p>
                            </div>
                            <field v-model="current_site.config.globals.custom_challenge.var_name"
                                    label="Variable Name">
                                The header, cookie or argument that contains a unique value to identify the user
                            </field>
                            <field v-model="current_site.config.globals.custom_challenge.validator_type"
                                    label="Hashing Mechanism">
                                Do not change unless instructed
                            </field>
                        </div>
                        <div class="column">
                            <field
                                v-model="current_site.config.globals.custom_challenge.grace"
                                label="Grace Period"
                                :error="errors.includes ( 'grace' )"
                                addon="seconds"
                                disabled="true"
                            >
                                Number of seconds considered as "grace time" for late arrivals of signatures
                            </field>
                            <field v-model="current_site.config.globals.custom_challenge.grace_var_name"
                                    label="Grace Variable Name">
                                The header, cookie or argument used to transmit the request's timestamp
                            </field>
                        </div>
                    </div>
                    <label class="checkbox is-size-7">
                        <input type="checkbox" @click="collapseToggle" v-model="isOldParamsEnabled"/>
                        enable
                    </label>
                </fieldset>
            </div>
        </div>
    </div>
</div>
</template>
<script>
export default {
}
</script>
<style lang="">
</style>
